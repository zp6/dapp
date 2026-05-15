/**
 * Wallet Balance Alarm
 * Addresses issue #137: Wallet Balance Alarm
 */

class WalletBalanceAlarm {
    constructor() {
        this.alarms = new Map();
        this.checkInterval = null;
        this.currentBalance = 0;
    }

    setBalance(balance) {
        this.currentBalance = balance;
        return this.checkAlarms();
    }

    addAlarm({ id, type, threshold, enabled = true }) {
        const alarm = {
            id: id || Date.now().toString(),
            type,
            threshold,
            enabled,
            createdAt: new Date().toISOString(),
            triggered: false
        };
        this.alarms.set(alarm.id, alarm);
        return alarm;
    }

    removeAlarm(id) { return this.alarms.delete(id); }

    checkAlarms() {
        const triggered = [];
        for (const [id, alarm] of this.alarms) {
            if (!alarm.enabled || alarm.triggered) continue;
            let isTriggered = false;
            if (alarm.type === 'below') isTriggered = this.currentBalance < alarm.threshold;
            else if (alarm.type === 'above') isTriggered = this.currentBalance > alarm.threshold;
            if (isTriggered) {
                alarm.triggered = true;
                alarm.triggeredAt = new Date().toISOString();
                triggered.push(alarm);
            }
        }
        return triggered;
    }

    startMonitoring(getBalanceFn, intervalMs = 60000) {
        this.stopMonitoring();
        this.checkInterval = setInterval(async () => {
            const balance = await getBalanceFn();
            this.setBalance(balance);
        }, intervalMs);
    }

    stopMonitoring() {
        if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = null; }
    }

    getAlarms() { return Array.from(this.alarms.values()); }
}

module.exports = WalletBalanceAlarm;
