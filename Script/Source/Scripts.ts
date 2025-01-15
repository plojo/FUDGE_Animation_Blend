namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  @ƒ.serialize
  export class CharacterController extends ƒ.ComponentScript {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(CharacterController);

    private stateBody: "idle" | "move" | "jump" | "fall" = "idle";
    private stateUpper: "empty" | "sheathe" = "empty";


    private walkSpeed: number = 1.5;
    private runSpeed: number = 5;
    private cmpAnimationGraph: ƒ.ComponentAnimationGraph;
    private cmpRigidbody: ƒ.ComponentRigidbody;

    @ƒ.serialize(ƒ.Node)
    private camera: ƒ.Node;

    @ƒ.serialize(ƒ.Animation)
    private animationIdling: ƒ.Animation;
    @ƒ.serialize(ƒ.Animation)
    private animationWalking: ƒ.Animation;
    @ƒ.serialize(ƒ.Animation)
    private animationRunning: ƒ.Animation;
    @ƒ.serialize(ƒ.Animation)
    private animationJumping: ƒ.Animation;
    @ƒ.serialize(ƒ.Animation)
    private animationFalling: ƒ.Animation;
    @ƒ.serialize(ƒ.Animation)
    private animationSheathing: ƒ.Animation;

    #empty: ƒ.AnimationNodeAnimation;
    #idling: ƒ.AnimationNodeAnimation;
    #walking: ƒ.AnimationNodeAnimation;
    #running: ƒ.AnimationNodeAnimation;
    #moving: ƒ.AnimationNodeBlend;
    #jumping: ƒ.AnimationNodeAnimation;
    #falling: ƒ.AnimationNodeAnimation;
    #sheathing: ƒ.AnimationNodeAnimation;

    #layerBase: ƒ.AnimationNodeTransition;
    #layerUpper: ƒ.AnimationNodeTransition;

    #input: ƒ.Vector2 = ƒ.Vector2.ZERO();
    #speed: number = this.walkSpeed;
    #grounded: boolean = true;

    public constructor() {
      super();
      this.addEventListener("update", this.start, { once: true });
      this.addEventListener("update", this.update);
    }

    public start = (): void => {
      ƒ.Debug.group(this.constructor.name + " Start")

      this.cmpAnimationGraph = this.node.getComponent(ƒ.ComponentAnimationGraph);
      this.cmpRigidbody = this.node.getComponent(ƒ.ComponentRigidbody);
      this.cmpRigidbody.effectRotation = ƒ.Vector3.ZERO();

      this.#empty = new ƒ.AnimationNodeAnimation();

      this.#idling = new ƒ.AnimationNodeAnimation(this.animationIdling);
      this.#walking = new ƒ.AnimationNodeAnimation(this.animationWalking, { offset: this.animationWalking.totalTime * 0.3 });
      this.#running = new ƒ.AnimationNodeAnimation(this.animationRunning, { offset: this.animationRunning.totalTime * 0.3, speed: this.animationRunning.totalTime / this.animationWalking.totalTime });
      this.#moving = new ƒ.AnimationNodeBlend([this.#walking, this.#running]);
      Reflect.set(this.#moving, "test", true);

      this.#jumping = new ƒ.AnimationNodeAnimation(this.animationJumping, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE });
      this.#sheathing = new ƒ.AnimationNodeAnimation(this.animationSheathing, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE });
      this.#falling = new ƒ.AnimationNodeAnimation(this.animationFalling);

      this.#layerBase = new ƒ.AnimationNodeTransition(this.#idling);
      this.#layerUpper = new ƒ.AnimationNodeTransition(this.#empty);
      this.cmpAnimationGraph.root = new ƒ.AnimationNodeBlend([this.#layerBase, this.#layerUpper]);

      document.onkeydown = (_event: KeyboardEvent) => {
        switch (_event.code) {
          case ƒ.KEYBOARD_CODE.E:
            if (this.stateUpper == "sheathe")
              return;

            this.stateUpper = "sheathe";
            this.#layerUpper.transit(this.#sheathing, 300);
            break;
          case ƒ.KEYBOARD_CODE.SPACE:
            if (!this.#grounded || this.stateBody == "jump")
              return;

            let velocity: ƒ.Vector3 = this.cmpRigidbody.getVelocity();
            velocity.y = 5;
            this.cmpRigidbody.setVelocity(velocity);
            this.#grounded = false;
            this.#layerBase.transit(this.#jumping, 200);
            this.stateBody = "jump";
            break;
        }
      }

      this.cmpAnimationGraph.addEventListener("sheathingend", () => {
        if (this.stateUpper != "sheathe")
          return;

        this.stateUpper = "empty";
        this.#layerUpper.transit(this.#empty, 300);
      });

      ƒ.Debug.groupEnd();
    }

    public update = (): void => {
      const deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
      // const wasMoving: boolean = this.#input.magnitudeSquared > 0;

      this.#input.x = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
      this.#input.y = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);

      const isMoving: boolean = this.#input.magnitudeSquared > 0;
      // const wasGrounded: boolean = this.#grounded;

      if (this.stateBody != "jump") {
        let rayHitInfo: ƒ.RayHitInfo = ƒ.Physics.raycast(ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(0, 0.1, 0)), ƒ.Vector3.Y(-1), 0.15, true);
        this.#grounded = rayHitInfo.hit;
      }

      if (!this.#grounded && this.stateBody != "fall" && this.cmpRigidbody.getVelocity().y < 0) {
        this.#layerBase.transit(this.#falling, this.stateBody == "jump" ? 1000 : 300);
        this.stateBody = "fall";
      } if (this.stateBody != "move" && this.#grounded && isMoving) {
        this.#layerBase.transit(this.#moving, 200);
        this.stateBody = "move";
      } else if (this.stateBody != "idle" && this.#grounded && !isMoving) {
        this.#layerBase.transit(this.#idling, 200);
        this.stateBody = "idle";
      }

      let acceleration: number = 0;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) && isMoving)
        acceleration = 4;
      else if (this.#speed > this.walkSpeed)
        acceleration = -4;

      this.#speed = ƒ.Calc.clamp(this.#speed + acceleration * deltaTime, this.walkSpeed, this.runSpeed);
      this.#running.weight = (this.#speed - this.walkSpeed) / (this.runSpeed - this.walkSpeed);
      let animationSpeed: number = 1 + this.#running.weight * this.#running.speed;
      this.#moving.speed = animationSpeed;

      if (!isMoving)
        return;

      // console.log(this.#speed);

      this.#input.normalize();

      let forward = this.camera.mtxWorld.forward;
      let right = this.camera.mtxWorld.right;
      forward.y = 0;
      right.y = 0;
      forward.normalize();
      right.normalize();
      forward.scale(this.#input.y);
      right.scale(this.#input.x);

      let velocity: ƒ.Vector3 = ƒ.Vector3.SUM(forward, right);
      let rotation = ƒ.Quaternion.ROTATION(velocity, ƒ.Vector3.Y()); // ƒ.Matrix4x4.LOOK_IN(this.node.mtxWorld.translation, velocity, ƒ.Vector3.Y()).rotation
      if (ƒ.Quaternion.DOT(rotation, this.node.mtxWorld.quaternion) < 0)
        rotation.negate();
      this.cmpRigidbody.setRotation(ƒ.Quaternion.SLERP(this.node.mtxWorld.quaternion, rotation, 0.5));
      velocity.scale(this.#speed);
      velocity.y = this.cmpRigidbody.getVelocity().y;
      this.cmpRigidbody.setVelocity(velocity);
    }
  }

  @ƒ.serialize
  export class CameraController extends ƒ.ComponentScript {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(CameraController);

    private radius: number = 7; // Distance from target
    private azimuth: number = 0; // Horizontal angle
    private elevation: number = 45; // Vertical angle
    private rotationSpeed: number = 30; // Degrees per second

    @ƒ.serialize(ƒ.Node)
    public target: ƒ.Node;

    public readonly axisX: ƒ.Axis = new ƒ.Axis("RotateX", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisY: ƒ.Axis = new ƒ.Axis("RotateY", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);

    #target: ƒ.Vector3 = ƒ.Vector3.ZERO();
    #velocity: ƒ.Vector3 = ƒ.Vector3.ZERO();

    #lastPos: ƒ.Vector3 = ƒ.Vector3.ZERO();

    public constructor() {
      super();
      this.addEventListener("update", this.start, { once: true });
      this.addEventListener("update", this.update);
    }

    public start = (): void => {
      ƒ.Debug.group(this.constructor.name + " Start")
      this.axisX.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, _event => this.azimuth += (<CustomEvent>_event).detail.output * this.rotationSpeed * ƒ.Loop.timeFrameReal / 1000);
      this.axisY.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, _event => this.elevation = ƒ.Calc.clamp(
        this.elevation - (<CustomEvent>_event).detail.output * this.rotationSpeed * ƒ.Loop.timeFrameReal / 1000,
        -85, // Limit looking up
        85   // Limit looking down
      ));
      this.#target.copy(this.target.mtxWorld.translation);
      ƒ.Debug.groupEnd();
    }

    public update = (): void => {
      let deltaTime: number = ƒ.Loop.timeFrameReal / 1000;

      let smoothTime: number = 0.5 / 5; // smooth time = lag distance / maximum speed, i.e. at speed 5 the maximum lag distance is 0.5.
      let target: ƒ.Vector3 = this.target.mtxWorld.translation.clone;
      target.y += 1;

      this.#target = ƒ.Vector3.SMOOTHDAMP(this.#target, target, this.#velocity, smoothTime, deltaTime);
      // console.log(this.#velocity.magnitude);

      // Convert spherical to Cartesian coordinates

      let rad = this.radius;
      let theta = this.azimuth * Math.PI / 180;
      let phi = this.elevation * Math.PI / 180;

      // Calculate new camera position
      let translation: ƒ.Vector3 = this.node.mtxLocal.translation;
      translation.x = this.#target.x + rad * Math.cos(phi) * Math.cos(theta);
      translation.y = this.#target.y + rad * Math.sin(phi);
      translation.z = this.#target.z + rad * Math.cos(phi) * Math.sin(theta);
      this.node.mtxLocal.translation = translation;

      this.node.mtxLocal.lookAt(this.#target, ƒ.Vector3.Y());

      this.#lastPos.copy(this.target.mtxWorld.translation);
    }

    drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void {
      ƒ.Gizmos.drawSphere(ƒ.Matrix4x4.COMPOSITION(this.#target, undefined, ƒ.Vector3.ONE(0.05)), ƒ.Color.CSS("red"));
    }
  }

  @ƒ.serialize
  export class CubeAnimator extends ƒ.ComponentScript {
    @ƒ.serialize(ƒ.Animation)
    public animationX: ƒ.Animation;
    @ƒ.serialize(ƒ.Animation)
    public animationY: ƒ.Animation;

    public constructor() {
      super();
      this.addEventListener("update", this.start, { once: true });
    }

    public start = (): void => {
      ƒ.Debug.group(this.constructor.name + " Start")

      this.animationX = new ƒ.Animation("AnimationX");
      let cmpAnimation: ƒ.ComponentAnimationGraph = this.node.getComponent(ƒ.ComponentAnimationGraph);
      let aNodeX: ƒ.AnimationNodeAnimation = new ƒ.AnimationNodeAnimation(this.animationX);
      let aNodeY: ƒ.AnimationNodeAnimation = new ƒ.AnimationNodeAnimation(this.animationY, { weight: 0.5 });
      let layers: ƒ.AnimationNodeBlend = new ƒ.AnimationNodeBlend([aNodeX, aNodeY]);
      cmpAnimation.root = layers;
      ƒ.Debug.groupEnd();
    }
  }

}