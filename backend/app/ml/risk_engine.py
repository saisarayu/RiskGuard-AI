import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List, Tuple
from ..schemas.risk import (
    RiskEvaluationInput,
    RiskScoreResultSchema,
    RiskFactorSchema,
    CustomerBaselineSchema,
    RiskMetricsSchema,
    SimulationPayloadSchema,
)

class ScikitRiskEngine:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            "amount_ratio",
            "velocity_10m",
            "is_new_device",
            "is_location_mismatch",
            "failed_attempts",
            "is_new_merchant",
            "account_age_days",
            "is_odd_hour"
        ]
        self._train_initial_model()

    def _train_initial_model(self):
        """Train the Scikit-learn model on synthetic training distributions."""
        np.random.seed(42)
        n_samples = 2500

        # Normal benign distribution (80%)
        n_normal = int(n_samples * 0.82)
        normal_amount_ratio = np.random.uniform(0.3, 2.2, n_normal)
        normal_velocity = np.random.choice([1, 2, 3], size=n_normal, p=[0.75, 0.20, 0.05])
        normal_new_device = np.random.choice([0, 1], size=n_normal, p=[0.92, 0.08])
        normal_location_mismatch = np.random.choice([0, 1], size=n_normal, p=[0.95, 0.05])
        normal_failed_attempts = np.random.choice([0, 1], size=n_normal, p=[0.96, 0.04])
        normal_new_merchant = np.random.choice([0, 1], size=n_normal, p=[0.85, 0.15])
        normal_account_age = np.random.uniform(60, 1200, n_normal)
        normal_odd_hour = np.random.choice([0, 1], size=n_normal, p=[0.90, 0.10])
        normal_labels = np.zeros(n_normal)

        # Anomalous fraud distribution (18%)
        n_fraud = n_samples - n_normal
        fraud_amount_ratio = np.random.uniform(4.0, 35.0, n_fraud)
        fraud_velocity = np.random.randint(4, 18, n_fraud)
        fraud_new_device = np.random.choice([0, 1], size=n_fraud, p=[0.15, 0.85])
        fraud_location_mismatch = np.random.choice([0, 1], size=n_fraud, p=[0.20, 0.80])
        fraud_failed_attempts = np.random.randint(2, 7, n_fraud)
        fraud_new_merchant = np.random.choice([0, 1], size=n_fraud, p=[0.30, 0.70])
        fraud_account_age = np.random.uniform(1, 90, n_fraud)
        fraud_odd_hour = np.random.choice([0, 1], size=n_fraud, p=[0.40, 0.60])
        fraud_labels = np.ones(n_fraud)

        X = np.column_stack([
            np.concatenate([normal_amount_ratio, fraud_amount_ratio]),
            np.concatenate([normal_velocity, fraud_velocity]),
            np.concatenate([normal_new_device, fraud_new_device]),
            np.concatenate([normal_location_mismatch, fraud_location_mismatch]),
            np.concatenate([normal_failed_attempts, fraud_failed_attempts]),
            np.concatenate([normal_new_merchant, fraud_new_merchant]),
            np.concatenate([normal_account_age, fraud_account_age]),
            np.concatenate([normal_odd_hour, fraud_odd_hour]),
        ])
        y = np.concatenate([normal_labels, fraud_labels])

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True

    def extract_features(self, inp: RiskEvaluationInput) -> Tuple[np.ndarray, Dict[str, Any]]:
        avg_amt = max(inp.averageCustomerTransaction or 2500.0, 100.0)
        amount_ratio = inp.amount / avg_amt
        is_odd_hour = 1 if (inp.timeOfDayHour is not None and 1 <= inp.timeOfDayHour <= 4) else 0
        is_loc_mismatch = 1 if (inp.previousLocation and inp.location != inp.previousLocation) else 0
        
        feature_vector = np.array([[
            amount_ratio,
            inp.velocityLast10m,
            1 if inp.isNewDevice else 0,
            is_loc_mismatch,
            inp.failedAttemptsLast24h,
            1 if inp.isNewMerchant else 0,
            inp.accountAgeDays or 365,
            is_odd_hour
        ]])

        context = {
            "amount_ratio": amount_ratio,
            "avg_amount": avg_amt,
            "is_location_mismatch": bool(is_loc_mismatch),
            "is_odd_hour": bool(is_odd_hour),
        }
        return feature_vector, context

    def evaluate(
        self,
        inp: RiskEvaluationInput,
        weights: Dict[str, int] = None,
        thresholds: Dict[str, int] = None
    ) -> RiskScoreResultSchema:
        if weights is None:
            weights = {
                "amountDeviationWeight": 22,
                "newDeviceWeight": 18,
                "locationMismatchWeight": 15,
                "velocityWeight": 20,
                "failedAttemptsWeight": 16,
                "newMerchantWeight": 10,
                "highRiskCategoryWeight": 12,
                "timeAnomalyWeight": 8,
            }
        if thresholds is None:
            thresholds = {
                "approveMax": 30,
                "verifyMax": 60,
                "holdMax": 80,
                "blockMin": 81,
            }

        feat_vec, ctx = self.extract_features(inp)
        feat_scaled = self.scaler.transform(feat_vec)
        ml_prob = float(self.model.predict_proba(feat_scaled)[0][1])

        # Decompose factor contributions
        factors: List[RiskFactorSchema] = []
        raw_score = 5 + int(ml_prob * 15)  # Baseline network risk

        # 1. Amount ratio
        amt_ratio = ctx["amount_ratio"]
        if amt_ratio >= 20.0:
            contrib = min(30, int(weights["amountDeviationWeight"] * 1.3))
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="AMOUNT_MASSIVE_SPIKE",
                name=f"Amount {amt_ratio:.0f}× customer average",
                contribution=contrib,
                description=f"Payment (₹{inp.amount:,.0f}) is {amt_ratio:.0f}x higher than historical average ₹{ctx['avg_amount']:,.0f}.",
                category="AMOUNT",
                severity="CRITICAL"
            ))
        elif amt_ratio >= 5.0:
            contrib = min(22, int(weights["amountDeviationWeight"] * 0.9))
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="AMOUNT_HIGH_SPIKE",
                name=f"Amount {amt_ratio:.1f}× customer average",
                contribution=contrib,
                description=f"Payment (₹{inp.amount:,.0f}) significantly exceeds historical spending average.",
                category="AMOUNT",
                severity="HIGH"
            ))
        elif amt_ratio >= 2.5:
            contrib = int(weights["amountDeviationWeight"] * 0.45)
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="AMOUNT_MODERATE_SPIKE",
                name="Higher than usual amount",
                contribution=contrib,
                description="Payment amount is moderately higher than usual baseline.",
                category="AMOUNT",
                severity="MEDIUM"
            ))

        # 2. Device novelty
        if inp.isNewDevice:
            contrib = weights["newDeviceWeight"]
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="DEVICE_UNRECOGNIZED",
                name="New / Unrecognized device fingerprint",
                contribution=contrib,
                description="Transaction originated from a previously unseen hardware/browser signature.",
                category="DEVICE",
                severity="HIGH"
            ))

        # 3. Location anomaly
        if ctx["is_location_mismatch"]:
            contrib = weights["locationMismatchWeight"]
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="LOCATION_ANOMALY",
                name="Unusual / Mismatched location",
                contribution=contrib,
                description=f"Originating city ({inp.location}) deviates from customer established activity hub.",
                category="LOCATION",
                severity="HIGH"
            ))

        # 4. Velocity burst
        if inp.velocityLast10m >= 10:
            contrib = min(30, int(weights["velocityWeight"] * 1.4))
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="VELOCITY_EXTREME",
                name="Critical transaction velocity burst",
                contribution=contrib,
                description=f"{inp.velocityLast10m} payment attempts recorded in the last 10 minutes (Bot/carding signature).",
                category="VELOCITY",
                severity="CRITICAL"
            ))
        elif inp.velocityLast10m >= 4:
            contrib = weights["velocityWeight"]
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="VELOCITY_HIGH",
                name="High transaction velocity",
                contribution=contrib,
                description=f"{inp.velocityLast10m} transactions initiated in a short 10-minute window.",
                category="VELOCITY",
                severity="HIGH"
            ))

        # 5. Failed attempts
        if inp.failedAttemptsLast24h >= 4:
            contrib = min(25, int(weights["failedAttemptsWeight"] * 1.3))
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="FAILED_ATTEMPTS_SPIKE",
                name=f"{inp.failedAttemptsLast24h} recent authorization failures",
                contribution=contrib,
                description="Repeated CVV/OTP declines noted prior to this checkout attempt.",
                category="BEHAVIOR",
                severity="HIGH"
            ))
        elif inp.failedAttemptsLast24h >= 2:
            contrib = int(weights["failedAttemptsWeight"] * 0.6)
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="FAILED_ATTEMPTS_MODERATE",
                name=f"{inp.failedAttemptsLast24h} recent declines",
                contribution=contrib,
                description="Prior authorization failures recorded in the last 24 hours.",
                category="BEHAVIOR",
                severity="MEDIUM"
            ))

        # 6. First time merchant
        if inp.isNewMerchant:
            contrib = weights["newMerchantWeight"]
            raw_score += contrib
            factors.append(RiskFactorSchema(
                code="MERCHANT_FIRST_TIME",
                name="First-time merchant interaction",
                contribution=contrib,
                description="Customer has no prior payment history with this merchant.",
                category="MERCHANT",
                severity="LOW"
            ))

        # Final score bounded 0-100
        final_score = min(100.0, max(1.0, float(raw_score)))

        # Decision thresholds
        if final_score <= thresholds["approveMax"]:
            risk_level = "LOW"
            decision = "APPROVE"
        elif final_score <= thresholds["verifyMax"]:
            risk_level = "MEDIUM"
            decision = "VERIFY"
        elif final_score <= thresholds["holdMax"]:
            risk_level = "HIGH"
            decision = "HOLD"
        else:
            risk_level = "CRITICAL"
            decision = "BLOCK"

        # Generate Explainable AI narrative
        explanation = self._generate_explanation(
            final_score, decision, amt_ratio, inp.amount, ctx["avg_amount"],
            inp.isNewDevice, ctx["is_location_mismatch"], inp.location,
            inp.velocityLast10m, inp.failedAttemptsLast24h, inp.isNewMerchant
        )

        return RiskScoreResultSchema(
            riskScore=final_score,
            riskLevel=risk_level,
            decision=decision,
            riskFactors=sorted(factors, key=lambda x: x.contribution, reverse=True),
            explanation=explanation,
            customerBaseline=CustomerBaselineSchema(
                averageAmount=ctx["avg_amount"],
                typicalRange=[round(ctx["avg_amount"] * 0.3), round(ctx["avg_amount"] * 2.2)],
                usualLocation=inp.previousLocation or "Hyderabad",
                usualDevice="Android Device",
                typicalDailyTxn=3
            ),
            metrics=RiskMetricsSchema(
                amountRatio=amt_ratio,
                velocityLast10m=inp.velocityLast10m,
                isNewDevice=inp.isNewDevice,
                isLocationAnomaly=ctx["is_location_mismatch"],
                failedAttempts=inp.failedAttemptsLast24h,
                isNewMerchant=inp.isNewMerchant,
                mlPredictionProbability=round(ml_prob, 3)
            ),
            modelType="Scikit-Learn Random Forest Classifier + Feature Attribution Engine"
        )

    def _generate_explanation(
        self, score: float, decision: str, amt_ratio: float, amount: float,
        avg_amt: float, is_new_device: bool, is_loc_mismatch: bool,
        location: str, velocity: int, failed: int, is_new_merch: bool
    ) -> str:
        if score <= 30:
            return (
                f"This transaction aligns closely with the customer's typical behavioral baseline. "
                f"The transaction amount (₹{amount:,.0f}) is within expected limits, initiated from a recognized device "
                f"in {location} with normal velocity. Risk level is low and safe to auto-approve."
            )

        reasons = []
        if amt_ratio >= 5.0:
            reasons.append(f"the payment amount (₹{amount:,.0f}) is significantly higher ({amt_ratio:.1f}×) than customer historical average of ₹{avg_amt:,.0f}")
        elif amt_ratio >= 2.0:
            reasons.append("the payment amount is moderately elevated compared to past transactions")

        if is_new_device:
            reasons.append("the transaction originated from a new, unrecognized device fingerprint")
        if is_loc_mismatch:
            reasons.append(f"the originating location ({location}) differs from customer typical activity center")
        if velocity >= 4:
            reasons.append(f"{velocity} rapid transactions occurred within the last 10 minutes")
        if failed >= 2:
            reasons.append(f"there were {failed} prior failed authorization attempts in the last 24 hours")
        if is_new_merch:
            reasons.append("this is the first transaction with this merchant")

        if not reasons:
            return f"This transaction presents statistical anomaly features warranting a risk score of {score:.0f}/100 and a recommendation to {decision}."

        if len(reasons) == 1:
            joined = reasons[0]
        else:
            joined = ", ".join(reasons[:-1]) + ", and " + reasons[-1]

        return f"This transaction was flagged with a risk score of {score:.0f}/100 because {joined}. The system recommends {decision} pending risk analyst verification."

risk_engine = ScikitRiskEngine()
