interface ISceneObject {
    scene: BABYLON.Scene
}

class AnimationFactory {

    public static CreateNumber(
        owner: ISceneObject,
        property: string,
        onUpdateCallback: () => void
    ): (target: number, duration: number) => void {
        return (target: number, duration: number) => {
            let origin: number = owner[property];
            let t = 0;
            if (owner[property + "_animation"]) {
                owner.scene.onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
            }
            let animationCB = () => {
                t += 1 / 60;
                let f = t / duration;
                if (f < 1) {
                    owner[property] = origin * (1 - f) + target * f;
                    if (onUpdateCallback) {
                        onUpdateCallback();
                    }
                }
                else {
                    owner[property] = target;
                    if (onUpdateCallback) {
                        onUpdateCallback();
                    }
                    owner.scene.onBeforeRenderObservable.removeCallback(animationCB);
                    owner[property + "_animation"] = undefined;
                }
            }
            owner.scene.onBeforeRenderObservable.add(animationCB);
            owner[property + "_animation"] = animationCB;
        }
    }
}