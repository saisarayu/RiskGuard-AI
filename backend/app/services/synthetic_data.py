from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.transaction import TransactionModel
from ..models.customer import CustomerModel
from ..models.merchant import MerchantModel
from ..models.investigation import InvestigationModel
from ..models.pattern import PatternModel
from ..ml.risk_engine import risk_engine, RiskEvaluationInput

def seed_database_if_empty(db: Session):
    """Seed synthetic transactions, customers, merchants, patterns, and investigations."""
    if db.query(CustomerModel).count() > 0:
        return  # Already populated

    print("[Database] Seeding initial synthetic data into database...")

    # 1. Customers
    customers_data = [
        {"id": "CUST-102", "name": "Aarav Sharma", "email": "aarav.sharma@example.com", "phone": "+91 98765 43210", "usualLocations": ["Hyderabad", "Secunderabad"], "knownDevices": ["Samsung Galaxy S23 (Android)", "OnePlus 11"], "avgAmount": 2500, "minRange": 500, "maxRange": 5000, "txnsPerDay": 3, "ageDays": 480},
        {"id": "CUST-103", "name": "Priya Venkatesh", "email": "priya.v@example.com", "phone": "+91 98450 11223", "usualLocations": ["Bengaluru"], "knownDevices": ["iPhone 15 Pro (iOS)", "MacBook Pro M2"], "avgAmount": 6200, "minRange": 1500, "maxRange": 12000, "txnsPerDay": 4, "ageDays": 720},
        {"id": "CUST-104", "name": "Rohan Mehta", "email": "rohan.mehta@example.com", "phone": "+91 98201 33445", "usualLocations": ["Mumbai", "Thane"], "knownDevices": ["Google Pixel 8 (Android)", "Windows PC"], "avgAmount": 3800, "minRange": 800, "maxRange": 7500, "txnsPerDay": 2, "ageDays": 310},
        {"id": "CUST-105", "name": "Ananya Deshmukh", "email": "ananya.d@example.com", "phone": "+91 98112 55667", "usualLocations": ["Pune"], "knownDevices": ["iPhone 14 (iOS)"], "avgAmount": 1800, "minRange": 300, "maxRange": 4000, "txnsPerDay": 3, "ageDays": 190},
        {"id": "CUST-106", "name": "Vikramaditya Roy", "email": "v.roy@example.com", "phone": "+91 98334 77889", "usualLocations": ["Kolkata"], "knownDevices": ["Xiaomi 13 Pro (Android)"], "avgAmount": 4200, "minRange": 1000, "maxRange": 8500, "txnsPerDay": 2, "ageDays": 600},
        {"id": "CUST-107", "name": "Sneha Kulkarni", "email": "sneha.k@example.com", "phone": "+91 98665 99001", "usualLocations": ["Chennai"], "knownDevices": ["Samsung Galaxy A54 (Android)"], "avgAmount": 2100, "minRange": 400, "maxRange": 4500, "txnsPerDay": 3, "ageDays": 140},
        {"id": "CUST-108", "name": "Kabir Singhania", "email": "kabir.s@example.com", "phone": "+91 98990 12345", "usualLocations": ["Delhi NCR", "Gurugram"], "knownDevices": ["iPhone 15 (iOS)", "iPad Pro"], "avgAmount": 14500, "minRange": 3000, "maxRange": 35000, "txnsPerDay": 5, "ageDays": 850},
        {"id": "CUST-109", "name": "Meera Nambiar", "email": "meera.n@example.com", "phone": "+91 98471 23456", "usualLocations": ["Kochi"], "knownDevices": ["Nothing Phone (2)"], "avgAmount": 3100, "minRange": 700, "maxRange": 6000, "txnsPerDay": 2, "ageDays": 260},
        {"id": "CUST-110", "name": "Aditya Verma", "email": "aditya.v@example.com", "phone": "+91 97110 34567", "usualLocations": ["Noida", "Delhi"], "knownDevices": ["Realme GT Neo (Android)"], "avgAmount": 1900, "minRange": 400, "maxRange": 3800, "txnsPerDay": 4, "ageDays": 95},
        {"id": "CUST-111", "name": "Tanvi Agarwal", "email": "tanvi.a@example.com", "phone": "+91 98290 45678", "usualLocations": ["Jaipur"], "knownDevices": ["Vivo X90 (Android)"], "avgAmount": 2800, "minRange": 600, "maxRange": 5500, "txnsPerDay": 2, "ageDays": 420},
    ]

    for c in customers_data:
        db.add(CustomerModel(
            id=c["id"],
            name=c["name"],
            email=c["email"],
            phone=c["phone"],
            accountAgeDays=c["ageDays"],
            totalTransactions=0,
            totalSpent=0,
            averageAmount=c["avgAmount"],
            typicalAmountRange=[c["minRange"], c["maxRange"]],
            usualLocations=c["usualLocations"],
            knownDevices=c["knownDevices"],
            typicalTxnPerDay=c["txnsPerDay"],
            riskScore=18.0,
            riskLevel="LOW",
            createdAt=datetime.utcnow() - timedelta(days=c["ageDays"]),
            status="ACTIVE"
        ))

    # 2. Merchants
    merchants_data = [
        {"id": "MERCH-501", "name": "Nova Electronics Hub", "category": "High-Value Electronics", "avgAmount": 28500, "refundRate": 2.1, "chargebackRate": 0.9, "fraudRate": 3.8, "isSuspicious": True, "location": "Bengaluru"},
        {"id": "MERCH-502", "name": "SwiftPay Instant Remit", "category": "Fintech / Crypto Voucher", "avgAmount": 45000, "refundRate": 0.4, "chargebackRate": 1.8, "fraudRate": 5.4, "isSuspicious": True, "location": "Mumbai"},
        {"id": "MERCH-503", "name": "BigBazaar Grocery Online", "category": "Daily Supermarket & Grocery", "avgAmount": 1450, "refundRate": 1.2, "chargebackRate": 0.05, "fraudRate": 0.2, "isSuspicious": False, "location": "Pan India"},
        {"id": "MERCH-504", "name": "UrbanKart Apparels", "category": "Fashion & Lifestyle", "avgAmount": 3200, "refundRate": 4.8, "chargebackRate": 0.2, "fraudRate": 0.6, "isSuspicious": False, "location": "New Delhi"},
        {"id": "MERCH-505", "name": "StreamFlix Entertainment", "category": "Digital Subscription", "avgAmount": 799, "refundRate": 0.3, "chargebackRate": 0.1, "fraudRate": 0.4, "isSuspicious": False, "location": "Mumbai"},
        {"id": "MERCH-506", "name": "CloudHost Global VPC", "category": "Cloud Infrastructure", "avgAmount": 12000, "refundRate": 0.8, "chargebackRate": 1.2, "fraudRate": 4.1, "isSuspicious": True, "location": "Hyderabad"},
        {"id": "MERCH-507", "name": "FoodExpress Deliveries", "category": "Food & Quick Commerce", "avgAmount": 550, "refundRate": 2.4, "chargebackRate": 0.08, "fraudRate": 0.3, "isSuspicious": False, "location": "Pan India"},
        {"id": "MERCH-508", "name": "Apex Game Credits", "category": "Gaming & Virtual Assets", "avgAmount": 4900, "refundRate": 1.1, "chargebackRate": 2.2, "fraudRate": 4.9, "isSuspicious": True, "location": "Pune"},
        {"id": "MERCH-509", "name": "Aura Luxury Watches", "category": "Luxury Retail", "avgAmount": 85000, "refundRate": 1.5, "chargebackRate": 1.1, "fraudRate": 3.2, "isSuspicious": True, "location": "Mumbai"},
    ]

    for idx, m in enumerate(merchants_data):
        db.add(MerchantModel(
            id=m["id"],
            name=m["name"],
            category=m["category"],
            totalTransactions=120 + idx * 85,
            totalVolume=float(m["avgAmount"] * (120 + idx * 85)),
            averageAmount=float(m["avgAmount"]),
            refundRate=m["refundRate"],
            chargebackRate=m["chargebackRate"],
            fraudRate=m["fraudRate"],
            riskScore=round(m["fraudRate"] * 14 + m["chargebackRate"] * 12 + 10),
            riskLevel="CRITICAL" if m["fraudRate"] > 3.5 else "HIGH" if m["fraudRate"] > 1.5 else "MEDIUM",
            isSuspicious=m["isSuspicious"],
            joinedDate=(datetime.utcnow() - timedelta(days=300 + idx * 40)).strftime("%Y-%m-%d"),
            location=m["location"]
        ))

    db.commit()

    # 3. Seed Showcase Transaction TXN-10234
    eval10234 = risk_engine.evaluate(RiskEvaluationInput(
        amount=75000,
        customerId="CUST-102",
        merchantId="MERCH-501",
        merchantCategory="High-Value Electronics",
        location="Hyderabad",
        previousLocation="Hyderabad",
        isNewDevice=True,
        isNewMerchant=True,
        velocityLast10m=12,
        failedAttemptsLast24h=3,
        accountAgeDays=480,
        timeOfDayHour=2,
        averageCustomerTransaction=2500.0
    ))

    txn10234 = TransactionModel(
        id="TXN-10234",
        amount=75000.0,
        currency="INR",
        timestamp=datetime.utcnow() - timedelta(minutes=12),
        customerId="CUST-102",
        customerName="Aarav Sharma",
        merchantId="MERCH-501",
        merchantName="Nova Electronics Hub",
        merchantCategory="High-Value Electronics",
        paymentMethod="Credit Card",
        location="Hyderabad",
        previousLocation="Hyderabad",
        ipAddress="185.220.101.45",
        deviceId="DEV-NEW-88910",
        deviceType="Windows",
        isNewDevice=True,
        isNewMerchant=True,
        failedAttemptsLast24h=3,
        velocityLast10m=12,
        velocityLast1h=18,
        timeSinceLastTxnMinutes=1,
        riskScore=92.0,
        riskLevel="CRITICAL",
        aiDecision="BLOCK",
        finalDecision="BLOCK",
        isOverridden=False,
        riskFactors=[f.model_dump() for f in eval10234.riskFactors],
        explanation=eval10234.explanation,
        patternTags=["New Device + Large Payment", "High Velocity"],
        investigationId="CASE-8801"
    )
    db.add(txn10234)

    # 4. Generate 260+ Batch Transactions
    for i in range(260):
        cust = customers_data[i % len(customers_data)]
        merch = merchants_data[(i * 3 + 1) % len(merchants_data)]
        minutes_ago = (i + 1) * 15

        is_new_device = False
        is_new_merch = False
        velocity_10m = 1
        failed_attempts = 0
        location = cust["usualLocations"][0]
        amount = 0.0
        pattern_tags = []

        if i % 32 == 0:
            velocity_10m = 12
            is_new_device = True
            amount = float(cust["avgAmount"] * 12 + 8000)
            pattern_tags.append("High Velocity")
        elif i % 22 == 0:
            location = "London (Proxy)"
            is_new_device = True
            amount = float(cust["avgAmount"] * 9 + 5000)
            pattern_tags.append("Location Anomaly")
        elif i % 16 == 0:
            failed_attempts = 4
            amount = float(merch["avgAmount"] * 1.6)
            is_new_merch = True
            pattern_tags.append("Repeated Failed Attempts")
        else:
            amount = float(max(250, round(cust["avgAmount"] * (0.6 + (i % 7) * 0.15))))

        evaluation = risk_engine.evaluate(RiskEvaluationInput(
            amount=amount,
            customerId=cust["id"],
            merchantId=merch["id"],
            location=location,
            previousLocation=cust["usualLocations"][0],
            isNewDevice=is_new_device,
            isNewMerchant=is_new_merch,
            velocityLast10m=velocity_10m,
            failedAttemptsLast24h=failed_attempts,
            accountAgeDays=cust["ageDays"],
            averageCustomerTransaction=float(cust["avgAmount"])
        ))

        db.add(TransactionModel(
            id=f"TXN-{10235 + i}",
            amount=amount,
            currency="INR",
            timestamp=datetime.utcnow() - timedelta(minutes=minutes_ago),
            customerId=cust["id"],
            customerName=cust["name"],
            merchantId=merch["id"],
            merchantName=merch["name"],
            merchantCategory=merch["category"],
            paymentMethod="UPI" if i % 2 == 0 else "Credit Card",
            location=location,
            previousLocation=cust["usualLocations"][0],
            ipAddress=f"122.172.{i % 250}.{i % 250}",
            deviceId=f"DEV-{hex(1000 + i)[2:].upper()}",
            deviceType="Android" if i % 3 == 0 else "iOS",
            isNewDevice=is_new_device,
            isNewMerchant=is_new_merch,
            failedAttemptsLast24h=failed_attempts,
            velocityLast10m=velocity_10m,
            velocityLast1h=velocity_10m + 2,
            timeSinceLastTxnMinutes=10,
            riskScore=evaluation.riskScore,
            riskLevel=evaluation.riskLevel,
            aiDecision=evaluation.decision,
            finalDecision=evaluation.decision,
            isOverridden=False,
            riskFactors=[f.model_dump() for f in evaluation.riskFactors],
            explanation=evaluation.explanation,
            patternTags=pattern_tags if pattern_tags else None
        ))

    # 5. Fraud Patterns
    patterns_data = [
        {
            "id": "PAT-VELOCITY-01",
            "name": "High Transaction Velocity Burst",
            "code": "VELOCITY_BURST",
            "description": "Multiple automated rapid-fire transactions from identical hardware/IP within short window.",
            "exampleScenario": "42 transactions from same device within 5 minutes attempting small-to-mid ticket draining.",
            "severity": "CRITICAL",
            "affectedTxnCount": 42,
            "totalExposure": 1845000.0,
            "transactionIds": ["TXN-10234"],
            "recommendation": "Enforce rate-limiting on device ID and apply mandatory SMS OTP on velocity > 5 txns/10m."
        },
        {
            "id": "PAT-DEVICE-02",
            "name": "New Device + High-Ticket Payment",
            "code": "NEW_DEVICE_HIGH_TICKET",
            "description": "High-value purchases initiated immediately upon first login from unrecognized hardware signature.",
            "exampleScenario": "18 high-value payments originated from previously unseen devices within 30 minutes of login.",
            "severity": "HIGH",
            "affectedTxnCount": 18,
            "totalExposure": 2460000.0,
            "transactionIds": ["TXN-10234"],
            "recommendation": "Place high-value orders from new devices on 15-minute verification hold."
        }
    ]

    for p in patterns_data:
        db.add(PatternModel(
            id=p["id"],
            name=p["name"],
            code=p["code"],
            description=p["description"],
            exampleScenario=p["exampleScenario"],
            severity=p["severity"],
            affectedTxnCount=p["affectedTxnCount"],
            totalExposure=p["totalExposure"],
            transactionIds=p["transactionIds"],
            recommendation=p["recommendation"]
        ))

    # 6. Initial Investigations
    db.add(InvestigationModel(
        id="CASE-8801",
        transactionId="TXN-10234",
        customerId="CUST-102",
        customerName="Aarav Sharma",
        merchantId="MERCH-501",
        merchantName="Nova Electronics Hub",
        amount=75000.0,
        riskScore=92.0,
        riskLevel="CRITICAL",
        status="OPEN",
        priority="CRITICAL",
        assignee="Sanjay Deshmukh",
        openedAt=datetime.utcnow() - timedelta(minutes=10),
        updatedAt=datetime.utcnow() - timedelta(minutes=5),
        summary="High-risk account takeover alert: ₹75,000 electronics purchase from new Windows machine.",
        aiExplanation=eval10234.explanation,
        notes=[
            {
                "id": "NOTE-1",
                "author": "RiskGuard AI Engine",
                "text": "Case automatically opened due to Risk Score (92) exceeding Critical Threshold (>80).",
                "timestamp": datetime.utcnow().isoformat()
            }
        ],
        tags=["Account Takeover", "High Velocity", "Electronics"]
    ))

    db.commit()
    print("[Database] Database seeded successfully with 260+ transactions.")
