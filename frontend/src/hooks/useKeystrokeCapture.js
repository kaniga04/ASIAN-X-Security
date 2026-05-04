import { useRef, useCallback, useState } from 'react';

export const useKeystrokeCapture = () => {
    const keystrokeData = useRef([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [keyCount, setKeyCount] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(0);
    const startTime = useRef(null);

    const startCapture = useCallback(() => {
        keystrokeData.current = [];
        startTime.current = Date.now();
        setIsCapturing(true);
        setKeyCount(0);
        setTypingSpeed(0);
        console.log('🎯 Keystroke capture STARTED');
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (!isCapturing) return;
        
        // 🆕 Record ALL keypresses immediately
        const keyData = {
            key: e.key,
            pressTime: Date.now(),
            releaseTime: null
        };
        
        keystrokeData.current.push(keyData);
        setKeyCount(prev => prev + 1);
    }, [isCapturing]);

    const handleKeyUp = useCallback((e) => {
        if (!isCapturing) return;

        // 🆕 Find and update the MOST RECENT unreleased press of this key
        const data = keystrokeData.current;
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].key === e.key && data[i].releaseTime === null) {
                data[i].releaseTime = Date.now();
                break;
            }
        }

        // Update typing speed
        if (startTime.current && keyCount > 0) {
            const elapsed = (Date.now() - startTime.current) / 1000;
            if (elapsed > 0) {
                setTypingSpeed(Math.round((keyCount / elapsed) * 100) / 100);
            }
        }
    }, [isCapturing, keyCount]);

    const getKeystrokeData = useCallback(() => {
        setIsCapturing(false);
        
        // 🆕 Get ALL events (even incomplete ones - backend will filter)
        const allEvents = [...keystrokeData.current];
        const validEvents = allEvents.filter(k => k.releaseTime !== null);
        
        console.log('⌨️ Keystroke captured:', {
            total: allEvents.length,
            valid: validEvents.length
        });
        
        // 🆕 Return ALL events - let backend decide validity
        return {
            events: allEvents,  // Send all, not just valid
            totalEvents: allEvents.length
        };
    }, []);

    const clearKeystrokeData = useCallback(() => {
        keystrokeData.current = [];
        startTime.current = null;
        setIsCapturing(false);
        setKeyCount(0);
        setTypingSpeed(0);
    }, []);

    return {
        startCapture,
        handleKeyDown,
        handleKeyUp,
        getKeystrokeData,
        clearKeystrokeData,
        isCapturing,
        keyCount,
        typingSpeed
    };
};

export default useKeystrokeCapture;