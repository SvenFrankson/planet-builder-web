// Code by Andrey Sitnik and Ivan Solovev https://github.com/ai/easings.net

class Easing {
    
    public static easeOutCubic(x: number): number {
        return 1 - Math.pow(1 - x, 3);
    }

    public static easeInOutSine(x: number): number {
        return - (Math.cos(Math.PI * x) - 1) / 2;
    }

    public static easeOutElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;
        
        return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    public static easeInOutBack(x: number): number {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        
        return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }
}