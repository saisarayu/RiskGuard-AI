import { dataStore } from './dataStoreService';

export class CopilotService {
  public static processQuery(query: string): string {
    const q = query.toLowerCase();
    const transactions = dataStore.transactions;
    const customers = dataStore.customers;
    const merchants = dataStore.merchants;
    const investigations = dataStore.investigations;

    // 1. Transaction Query
    const txnMatch = q.match(/txn-\d+/i);
    if (txnMatch) {
      const txnId = txnMatch[0].toUpperCase();
      const txn = transactions.find((t) => t.id === txnId);
      if (txn) {
        const cust = customers.find((c) => c.id === txn.customerId);
        return `### Backend AI Analysis for **${txn.id}**

* **Amount:** ₹${txn.amount.toLocaleString('en-IN')} (${txn.paymentMethod})
* **Customer:** ${txn.customerName} (${txn.customerId})
* **Merchant:** ${txn.merchantName} (${txn.merchantCategory})
* **Location & Device:** ${txn.location} • ${txn.deviceType} (${txn.isNewDevice ? 'NEW UNRECOGNIZED DEVICE' : 'Known'})
* **Risk Score:** **${txn.riskScore}/100** (${txn.riskLevel})
* **AI Recommendation:** **${txn.aiDecision}** ${txn.isOverridden ? `*(Overridden to ${txn.finalDecision})*` : ''}

#### 🔍 Explainable AI Telemetry:
> ${txn.explanation}

#### 📊 Baseline Deviations:
* Customer average: **₹${cust ? cust.averageAmount.toLocaleString('en-IN') : '2,500'}** vs Current: **₹${txn.amount.toLocaleString('en-IN')}**
* Velocity in last 10m: **${txn.velocityLast10m} attempts**
* Recent declines: **${txn.failedAttemptsLast24h} declines**`;
      } else {
        return `Transaction **${txnId}** was not found in the server database.`;
      }
    }

    // 2. Customer Query
    const custMatch = q.match(/cust-\d+|customer #?\d+|aarav|priya|rohan/i);
    if (custMatch) {
      const custSearchTerm = custMatch[0].toLowerCase();
      const cust = customers.find(
        (c) =>
          c.id.toLowerCase().includes(custSearchTerm) ||
          c.name.toLowerCase().includes(custSearchTerm)
      );

      if (cust) {
        return `### Customer Profile: **${cust.name}** (${cust.id})

* **Account Age:** ${cust.accountAgeDays} days
* **Customer Risk Score:** **${cust.riskScore}/100** (${cust.riskLevel})
* **Typical Average:** ₹${cust.averageAmount.toLocaleString('en-IN')} (Range: ₹${cust.typicalAmountRange[0]}–₹${cust.typicalAmountRange[1]})
* **Known Devices:** ${cust.knownDevices.join(', ')}
* **Usual Cities:** ${cust.usualLocations.join(', ')}`;
      }
    }

    // 3. Merchant Query
    if (q.includes('merchant') || q.includes('nova') || q.includes('swiftpay')) {
      const m = merchants[0];
      return `### Merchant Risk Audit: **${m.name}** (${m.id})

* **Category:** ${m.category}
* **Risk Score:** **${m.riskScore}/100** (${m.riskLevel})
* **Fraud Rate:** **${m.fraudRate}%** | **Chargeback Rate:** **${m.chargebackRate}%**
* **Total Volume:** ₹${(m.totalVolume / 100000).toFixed(1)}L`;
    }

    // 4. Investigations Summary
    if (q.includes('investigation') || q.includes('exposure') || q.includes('summary')) {
      const openCases = investigations.filter((i) => i.status === 'OPEN');
      const totalExp = investigations.reduce((a, b) => a + b.amount, 0);

      return `### 📋 Server Investigation Metrics
* **Open Cases:** **${openCases.length}**
* **Total Financial Exposure:** **₹${(totalExp / 100000).toFixed(1)} Lakhs**
* **Primary Case:** **${openCases[0]?.id || 'CASE-8801'}** (₹${openCases[0]?.amount || '75,000'})`;
    }

    return `Backend Copilot processed your request: There are ${transactions.length} active transactions and ${investigations.length} investigations in the server repository.`;
  }
}
