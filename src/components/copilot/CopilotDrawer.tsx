import React, { useState, useEffect, useRef } from 'react';
import { useRisk } from '../../context/RiskContext';
import { CopilotMessage, Transaction, Customer, Merchant, InvestigationCase } from '../../types';
import { RiskScorePill, DecisionBadge } from '../common/RiskBadge';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export const CopilotDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    copilotInitialPrompt,
    setCopilotInitialPrompt,
    transactions,
    customers,
    merchants,
    investigations,
    fraudPatterns,
    setSelectedTransaction,
  } = useRisk();

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'MSG-INIT-1',
      sender: 'assistant',
      content: `Hello! I am **RiskGuard Copilot**, your AI Risk & Fraud Analyst Assistant. 

I analyze real-time payment telemetry across behavioral baselines, device fingerprints, velocity patterns, and merchant risk profiles.

You can ask me questions like:
* *"Why was TXN-10234 blocked?"*
* *"What are the major risk factors for Customer #102?"*
* *"Show suspicious transactions from Nova Electronics Hub"*
* *"Summarize open investigations and highest financial exposure"*
* *"Explain the difference between Fraud Detection and False Positives"*`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming initial prompt from context trigger
  useEffect(() => {
    if (copilotInitialPrompt && isCopilotOpen) {
      handleSend(copilotInitialPrompt);
      setCopilotInitialPrompt('');
    }
  }, [copilotInitialPrompt, isCopilotOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Core natural language response generator against actual dataset context
  const generateCopilotResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Specific TXN Query
    const txnMatch = q.match(/txn-\d+/i);
    if (txnMatch) {
      const txnId = txnMatch[0].toUpperCase();
      const txn = transactions.find((t) => t.id === txnId);
      if (txn) {
        const cust = customers.find((c) => c.id === txn.customerId);
        return `### Analysis for **${txn.id}**

* **Amount:** ₹${txn.amount.toLocaleString('en-IN')} (${txn.paymentMethod})
* **Customer:** ${txn.customerName} (${txn.customerId})
* **Merchant:** ${txn.merchantName} (${txn.merchantCategory})
* **Location & Device:** ${txn.location} • ${txn.deviceType} (${txn.isNewDevice ? 'NEW UNRECOGNIZED DEVICE' : 'Known'})
* **Risk Score:** **${txn.riskScore}/100** (${txn.riskLevel})
* **AI Recommendation:** **${txn.aiDecision}** ${txn.isOverridden ? `*(Overridden to ${txn.finalDecision})*` : ''}

#### 🔍 Why was this transaction flagged?
> ${txn.explanation}

#### 📊 Baseline Comparison:
* Customer typical average: **₹${cust ? cust.averageAmount.toLocaleString('en-IN') : '2,500'}** (vs Current: ₹${txn.amount.toLocaleString('en-IN')})
* Velocity in last 10 minutes: **${txn.velocityLast10m} txns**
* Previous failed authorization declines: **${txn.failedAttemptsLast24h} attempts**

**Analyst Recommendation:** ${
          txn.riskScore >= 80
            ? 'Maintain BLOCK disposition and freeze payment credentials pending KYC.'
            : txn.riskScore >= 60
            ? 'Request step-up 2FA or conduct out-of-band verification.'
            : 'Low risk. Transaction is clear for settlement.'
        }`;
      } else {
        return `I couldn't find transaction **${txnId}** in the active dataset. Please check the ID or choose one from the Transactions tab.`;
      }
    }

    // 2. Specific Customer Query
    const custMatch = q.match(/cust-\d+|customer #?\d+|aarav|priya|rohan|ananya|kabir/i);
    if (custMatch) {
      const custSearchTerm = custMatch[0].toLowerCase();
      const cust = customers.find(
        (c) =>
          c.id.toLowerCase().includes(custSearchTerm) ||
          c.name.toLowerCase().includes(custSearchTerm)
      );

      if (cust) {
        const custTxns = transactions.filter((t) => t.customerId === cust.id);
        const highRiskTxns = custTxns.filter((t) => t.riskScore >= 60);

        return `### Customer Profile: **${cust.name}** (${cust.id})

* **Account Age:** ${cust.accountAgeDays} days (${cust.status})
* **Customer Risk Score:** **${cust.riskScore}/100** (${cust.riskLevel})
* **Historical Average Ticket:** ₹${cust.averageAmount.toLocaleString('en-IN')} (Range: ₹${cust.typicalAmountRange[0]}–₹${cust.typicalAmountRange[1]})
* **Usual Geographies:** ${cust.usualLocations.join(', ')}
* **Known Hardware:** ${cust.knownDevices.join(', ')}
* **Total Spending Recorded:** ₹${cust.totalSpent.toLocaleString('en-IN')} (${cust.totalTransactions} transactions)

#### ⚠️ Anomaly Summary:
* High-Risk / Suspicious Events: **${highRiskTxns.length}**
* Blocked Transactions: **${cust.blockedTxnCount}**
${
  highRiskTxns.length > 0
    ? `* Recent high-risk transaction: **${highRiskTxns[0].id}** (₹${highRiskTxns[0].amount.toLocaleString('en-IN')}) — *${highRiskTxns[0].explanation}*`
    : '* No active severe anomaly flags.'
}`;
      }
    }

    // 3. Merchant Query
    if (q.includes('merchant') || q.includes('nova') || q.includes('swiftpay') || q.includes('electronics') || q.includes('aura') || q.includes('apex')) {
      const targetMerch = merchants.find((m) =>
        q.includes(m.name.toLowerCase()) || q.includes(m.category.toLowerCase()) || m.fraudRate > 3.0
      ) || merchants[0];

      return `### Merchant Risk Audit: **${targetMerch.name}** (${targetMerch.id})

* **Category:** ${targetMerch.category}
* **Merchant Risk Score:** **${targetMerch.riskScore}/100** (${targetMerch.riskLevel})
* **Fraud Rate:** **${targetMerch.fraudRate}%** (Industry SLA: < 1.0%)
* **Chargeback Rate:** **${targetMerch.chargebackRate}%**
* **Refund Rate:** **${targetMerch.refundRate}%**
* **Total Volume:** ₹${(targetMerch.totalVolume / 100000).toFixed(1)}L

**Copilot Assessment:** ${
        targetMerch.fraudRate > 3.0
          ? `⚠️ Elevated fraud incidence detected. This merchant processes a high proportion of new-device and high-velocity attempts. Recommended to enforce pre-authorization 3D Secure 2.0 on all transactions exceeding ₹10,000.`
          : `Healthy risk metrics within standard card scheme tolerances.`
      }`;
    }

    // 4. Summarize Investigations / Financial Exposure
    if (q.includes('investigation') || q.includes('summary') || q.includes('exposure') || q.includes('open')) {
      const openCases = investigations.filter((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING');
      const totalExp = investigations.reduce((a, b) => a + b.amount, 0);

      return `### 📋 Risk Operations & Investigations Summary

* **Active Open / Investigating Cases:** **${openCases.length}** out of ${investigations.length} total cases
* **Financial Exposure at Risk:** **₹${(totalExp / 100000).toFixed(1)} Lakhs**
* **Highest Priority Incidents:**
${openCases
  .slice(0, 3)
  .map(
    (c) => `  1. **${c.id}** (${c.transactionId}): ₹${c.amount.toLocaleString('en-IN')} — *${c.summary}* (Risk Score: ${c.riskScore})`
  )
  .join('\n')}

**Next Recommended Action:** Review Case **${openCases[0]?.id || 'CASE-8801'}** and verify customer phone OTP logs.`;
    }

    // 5. Fraud Patterns Query
    if (q.includes('pattern') || q.includes('velocity') || q.includes('failed attempt') || q.includes('vpn') || q.includes('location')) {
      return `### 🛡️ Active Fraud Patterns Detected by RiskGuard AI

1. **High Transaction Velocity Burst:** Automated bot attacks generating up to 42 micro/mid-ticket transactions within 5 minutes.
2. **New Device + High-Ticket Purchases:** Credential stuffing & account takeovers where newly paired hardware initiates payments 20×–30× higher than customer average.
3. **Impossible Travel / Geolocation Anomaly:** Users active in Indian metro hubs suddenly executing card transactions through Romanian, Singaporean, or UK datacenter VPN proxies.
4. **Card Testing / Authorization Failures:** Sequential CVV declines followed by an abrupt high-value checkout.

All patterns are actively monitored and assigned dynamic factor point penalties.`;
    }

    // 6. General Fraud Principle / False Positive Query
    if (q.includes('false positive') || q.includes('principle') || q.includes('guarantee') || q.includes('score')) {
      return `### 💡 Core Fintech Risk Principle: Risk Estimation vs Guaranteed Fraud

In modern fintech architecture:
1. **The AI engine estimates risk based on observable signals**, it does not possess omniscient knowledge of fraud.
2. **Risk Score ≠ Guaranteed Fraud:** A score of 92 indicates extreme statistical anomaly, but could still represent a legitimate VIP customer making an emergency hospital or festive purchase from a new vacation laptop.
3. **The False Positive Balance:** Overly aggressive blocking creates checkout friction and brand churn. RiskGuard AI uses intermediate **VERIFY (31–60)** and **HOLD (61–80)** states alongside human analyst overrides to maintain a healthy False Positive Rate (< 4.0%).`;
    }

    // Default Fallback
    return `I analyzed your query against the active dataset. 

Here are key metrics you can inspect:
* **Total Transactions Processed:** ${transactions.length} synthetic records
* **High-Risk Flagged (>60):** ${transactions.filter((t) => t.riskScore >= 60).length} transactions
* **Open Cases:** ${investigations.filter((i) => i.status === 'OPEN').length} cases

Feel free to ask specifically about any transaction (e.g. *"Why was TXN-10234 blocked?"*) or customer (e.g. *"Show Customer #102 risk profile"*).`;
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `MSG-USER-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      // Query Python FastAPI Gemini Copilot endpoint
      const response = await fetch('/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: CopilotMessage = {
          id: `MSG-AI-${Date.now()}`,
          sender: 'assistant',
          content: data.answer,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
        return;
      }
    } catch (e) {
      // Graceful fallback to client engine
    }

    setTimeout(() => {
      const responseText = generateCopilotResponse(query);
      const assistantMsg: CopilotMessage = {
        id: `MSG-AI-${Date.now()}`,
        sender: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  if (!isCopilotOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0a0f1c] border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">RiskGuard Copilot</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Context-grounded natural language copilot</p>
          </div>
        </div>

        <button
          onClick={() => setIsCopilotOpen(false)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
          Suggested Copilot Queries:
        </span>
        <div className="flex space-x-2 pb-1">
          {[
            'Why was TXN-10234 blocked?',
            'Major risk factors for Customer #102?',
            'Show suspicious transactions from Nova Electronics',
            'Summarize open investigations',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-violet-950/60 border border-slate-800 hover:border-violet-500/40 text-slate-300 hover:text-violet-200 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Parse Markdown snippets gracefully */}
                <div className="whitespace-pre-line font-sans prose prose-invert prose-xs">
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] text-right font-mono ${
                    isUser ? 'text-cyan-200' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-3 rounded-2xl bg-slate-900/50 max-w-xs">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span>RiskGuard Copilot is querying telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-3.5 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about a transaction, customer, merchant, or anomaly..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
