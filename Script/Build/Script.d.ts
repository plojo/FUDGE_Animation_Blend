declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CharacterController extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        private stateBody;
        private stateUpper;
        private walkSpeed;
        private runSpeed;
        private cmpAnimationGraph;
        private cmpRigidbody;
        private camera;
        private animationIdling;
        private animationWalking;
        private animationRunning;
        private animationJumping;
        private animationFalling;
        private animationSheathing;
        constructor();
        start: () => void;
        update: () => void;
    }
    class CameraController extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        private radius;
        private azimuth;
        private elevation;
        private rotationSpeed;
        target: ƒ.Node;
        readonly axisX: ƒ.Axis;
        readonly axisY: ƒ.Axis;
        constructor();
        start: () => void;
        update: () => void;
        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void;
    }
    class CubeAnimator extends ƒ.ComponentScript {
        animationX: ƒ.Animation;
        animationY: ƒ.Animation;
        constructor();
        start: () => void;
    }
}
