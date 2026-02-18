const events: Record<string, ((data: any) => void)[]> = {};

const unsubscribe = (eventName: string, callback: (data: any) => void) => {
    if (!events[eventName]) {
        return;
    }

    events[eventName] = events[eventName].filter((cb) => cb !== callback);
};

const subscribe = (eventName: string, callback: (data: any) => void) => {
    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);

    return () => unsubscribe(eventName, callback);
};

const publish = (eventName: string, data: any) => {
    if (!events[eventName]) {
        return;
    }

    events[eventName].forEach((callback) => callback(data));
};

const pubsub = {
    unsubscribe,
    subscribe,
    publish,
};

export default pubsub;
