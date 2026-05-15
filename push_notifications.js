/**
 * Doichain Push Notifications
 * Addresses issue #145: Doichain Push Notifications
 */

class PushNotificationManager {
    constructor() {
        this.subscriptions = new Map();
        this.isSupported = 'Notification' in window && 'PushManager' in window;
    }

    async requestPermission() {
        if (!this.isSupported) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async subscribe(walletAddress) {
        if (!await this.requestPermission()) return null;
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
        });
        this.subscriptions.set(walletAddress, subscription);
        return subscription;
    }

    async notify(walletAddress, { title, body, icon, data }) {
        const notification = new Notification(title, {
            body,
            icon: icon || '/icons/doichain-192.png',
            data: data || {},
            vibrate: [200, 100, 200],
        });
        notification.onclick = (event) => {
            event.notification.close();
            if (data && data.url) window.open(data.url, '_blank');
        };
        return true;
    }

    notifyTransaction(walletAddress, txType, amount) {
        const messages = {
            received: 'Received ' + amount + ' DOI',
            sent: 'Sent ' + amount + ' DOI',
            confirmed: 'Transaction confirmed: ' + amount + ' DOI',
        };
        return this.notify(walletAddress, {
            title: 'Doichain Transaction',
            body: messages[txType] || 'New transaction activity',
            data: { type: txType, amount }
        });
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }
}

module.exports = PushNotificationManager;
