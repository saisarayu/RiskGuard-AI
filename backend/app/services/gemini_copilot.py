import os
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..core.config import settings
from ..models.transaction import TransactionModel
from ..models.customer import CustomerModel
from ..models.merchant import MerchantModel
from ..models.investigation import InvestigationModel

class GeminiCopilotService:
    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self):
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                print(f"[Copilot] Google GenAI client initialization note: {e}")
                self.client = None

    def query(self, prompt: str, db: Session, context_data: Optional[Dict[str, Any]] = None) -> str:
        q = prompt.lower().strip()
        
        # 1. Fetch relevant context from DB for grounding
        txn_count = db.query(TransactionModel).count()
        open_cases = db.query(InvestigationModel).filter(InvestigationModel.status == "OPEN").count()

        # If Gemini API Client is initialized, build grounded prompt and invoke model
        if self.client:
            try:
                # Gather recent anomalies as context
                recent_high_risk = db.query(TransactionModel).filter(TransactionModel.riskScore >= 70).limit(5).all()
                context_summary = f"Database telemetry: {txn_count} total transactions, {open_cases} open investigations.\n"
                if recent_high_risk:
                    context_summary += "Recent High Risk Incidents:\n" + "\n".join(
                        [f"- {t.id}: ₹{t.amount} at {t.merchantName} (Customer: {t.customerName}, Score: {t.riskScore}/100, Reason: {t.explanation})" for t in recent_high_risk]
                    )

                system_instruction = (
                    "You are RiskGuard Copilot, an elite AI Payment Risk & Fraud Analyst for RiskGuard AI. "
                    "You help fraud analysts understand transaction anomalies, customer behavioral deviations, "
                    "merchant fraud rates, and investigation priorities. "
                    "IMPORTANT PRINCIPLE: The AI estimates risk based on signals, not guaranteed fraud. "
                    "Balance fraud prevention with false positive friction. "
                    "Use crisp markdown formatting with bold metrics and bullet points."
                )

                full_prompt = f"{system_instruction}\n\nGrounding Context:\n{context_summary}\n\nUser Question:\n{prompt}"
                
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=full_prompt,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"[Copilot] Gemini API call error: {e}. Falling back to deterministic reasoning.")

        # Deterministic Grounded Fallback Engine
        return self._local_grounded_reasoning(prompt, db)

    def _local_grounded_reasoning(self, prompt: str, db: Session) -> str:
        q = prompt.lower()

        # Specific TXN Query
        import re
        txn_match = re.search(r"txn-\d+", q)
        if txn_match:
            txn_id = txn_match.group(0).upper()
            txn = db.query(TransactionModel).filter(TransactionModel.id == txn_id).first()
            if txn:
                cust = db.query(CustomerModel).filter(CustomerModel.id == txn.customerId).first()
                return (
                    f"### 🛡️ AI Risk Telemetry for **{txn.id}**\n\n"
                    f"* **Amount:** ₹{txn.amount:,.0f} ({txn.paymentMethod})\n"
                    f"* **Customer:** {txn.customerName} (`{txn.customerId}`)\n"
                    f"* **Merchant:** {txn.merchantName} ({txn.merchantCategory})\n"
                    f"* **Device & Geo:** {txn.location} • {txn.deviceType} ({'NEW UNRECOGNIZED DEVICE' if txn.isNewDevice else 'Known Device'})\n"
                    f"* **Calculated Risk Score:** **{txn.riskScore:.0f}/100** ({txn.riskLevel})\n"
                    f"* **Recommendation:** **{txn.aiDecision}** {'*(Overridden by Analyst)*' if txn.isOverridden else ''}\n\n"
                    f"#### 🔍 Explainable AI Root Cause:\n"
                    f"> {txn.explanation}\n\n"
                    f"#### 📊 Baseline Comparison:\n"
                    f"* Customer Typical Average: **₹{cust.averageAmount:,.0f}** if cust else '₹2,500' vs Current: **₹{txn.amount:,.0f}**\n"
                    f"* Velocity in last 10m: **{txn.velocityLast10m} attempts**\n"
                    f"* Recent authorization declines: **{txn.failedAttemptsLast24h} declines**"
                )
            else:
                return f"Transaction `{txn_id}` was not found in the platform database."

        # Customer Query
        cust_match = re.search(r"cust-\d+|customer #?\d+|aarav|priya|rohan", q)
        if cust_match:
            cust = db.query(CustomerModel).filter(
                (CustomerModel.id.ilike(f"%{cust_match.group(0)}%")) |
                (CustomerModel.name.ilike(f"%{cust_match.group(0)}%"))
            ).first()
            if not cust:
                cust = db.query(CustomerModel).first()
            
            if cust:
                return (
                    f"### 👤 Customer Profile: **{cust.name}** (`{cust.id}`)\n\n"
                    f"* **Account Age:** {cust.accountAgeDays} days ({cust.status})\n"
                    f"* **Risk Score:** **{cust.riskScore:.0f}/100** ({cust.riskLevel})\n"
                    f"* **Historical Average Ticket:** ₹{cust.averageAmount:,.0f}\n"
                    f"* **Usual Locations:** {', '.join(cust.usualLocations)}\n"
                    f"* **Known Devices:** {', '.join(cust.knownDevices)}\n"
                    f"* **Suspicious Flags:** {cust.suspiciousTxnCount} | **Blocked:** {cust.blockedTxnCount}"
                )

        # Merchant Query
        if "merchant" in q or "nova" in q or "swiftpay" in q or "electronics" in q:
            merch = db.query(MerchantModel).filter(MerchantModel.fraudRate > 3.0).first()
            if not merch:
                merch = db.query(MerchantModel).first()
            if merch:
                return (
                    f"### 🏪 Merchant Risk Audit: **{merch.name}** (`{merch.id}`)\n\n"
                    f"* **Category:** {merch.category}\n"
                    f"* **Risk Score:** **{merch.riskScore:.0f}/100** ({merch.riskLevel})\n"
                    f"* **Fraud Rate:** **{merch.fraudRate}%** (Industry SLA: < 1.0%)\n"
                    f"* **Chargeback Rate:** **{merch.chargebackRate}%**\n"
                    f"* **Total Volume:** ₹{(merch.totalVolume / 100000):.1f}L\n\n"
                    f"**Recommendation:** Enforce pre-authorization 3D Secure 2.0 step-up for orders exceeding ₹10,000."
                )

        # Investigations / Exposure Query
        if "investigation" in q or "exposure" in q or "summary" in q or "open" in q:
            open_cases = db.query(InvestigationModel).filter(InvestigationModel.status == "OPEN").all()
            total_exp = sum(c.amount for c in open_cases)
            return (
                f"### 📋 Active Investigations & Exposure Brief\n\n"
                f"* **Pending Open Cases:** **{len(open_cases)}** cases requiring triage\n"
                f"* **Total Financial Exposure:** **₹{(total_exp / 100000):.1f} Lakhs**\n"
                f"* **Primary Incident:** `{open_cases[0].id if open_cases else 'CASE-8801'}` (₹{open_cases[0].amount:,.0f} if open_cases else '75,000' - High Velocity Account Takeover)"
            )

        # Default fallback
        total_txns = db.query(TransactionModel).count()
        return (
            f"RiskGuard Copilot evaluated your query against active telemetry.\n\n"
            f"* **Live Database:** {total_txns} transactions indexed\n"
            f"* **Engine Status:** Scikit-Learn Hybrid Random Forest model running\n"
            f"Ask about any transaction ID (e.g. `TXN-10234`), customer (e.g. `CUST-102`), or merchant exposure."
        )

gemini_copilot = GeminiCopilotService()
