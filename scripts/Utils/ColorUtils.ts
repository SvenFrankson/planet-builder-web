interface IHSL {
    h: number;
    s: number;
    l: number;
}

class ColorUtils {

    public static RGBToHSL(color: BABYLON.Color3 | BABYLON.Color4): IHSL {
        let r = color.r;
        let g = color.g;
        let b = color.b;
        let cMax = Math.max(r, g, b);
        let cMin = Math.min(r, g, b);
        let d = cMax - cMin;
        
        let h = 0;
        let s = 0;
        let l = (cMax + cMin) * 0.5;

        if (d > 0) {
            if (d === r) {
                h = Math.round(60 * ((g - b) / d))
            }
            else if (d === g) {
                h = Math.round(60 * ((b - r) / d))
            }
            else if (d === b) {
                h = Math.round(60 * ((r - g) / d))
            }
            if (h >= 360) {
                h -= 360;
            }

            s = d / (1 - Math.abs(2 * l - 1));
        }

        return {
            h: h,
            s: s,
            l: l
        }
    }

    public static HSLToRGBToRef(hsl: IHSL, ref: BABYLON.Color3 | BABYLON.Color4): void {
        let c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
        let x = c * (1 - Math.abs((hsl.h / 60) % 2 - 1));
        let m = hsl.l - c / 2;
        if (hsl.h < 60) {
            ref.r = c + m;
            ref.g = x + m;
            ref.b = m;
        }
        else if (hsl.h < 120) {
            ref.r = x + m;
            ref.g = c + m;
            ref.b = m;
        }
        else if (hsl.h < 180) {
            ref.r = m;
            ref.g = c + m;
            ref.b = x + m;
        }
        else if (hsl.h < 240) {
            ref.r = m;
            ref.g = x + m;
            ref.b = c + m;
        }
        else if (hsl.h < 300) {
            ref.r = x + m;
            ref.g = m;
            ref.b = c + m;
        }
        else {
            ref.r = c + m;
            ref.g = m;
            ref.b = x + m;
        }
    }
}