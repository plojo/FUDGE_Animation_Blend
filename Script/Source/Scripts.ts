namespace Script {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  function logged(_value: any, _context: DecoratorContext): any {
    const metadata: any = _context.metadata;

    if (_context.kind === 'field') { // (A)
      if (!metadata["log"])
        metadata["log"] = [];

      metadata["log"].push(_context.name);
    }
    if (_context.kind === 'class') { // (B)
      return class extends _value {
        public constructor(...args: any[]) {
          super(...args);
          for (const key of metadata["log"]) {
            const get = () => {
              return this["ƒ" + key];
            }
            const set = (_value: any) => {
              console.log(key, _value);
              this["ƒ" + key] = _value;
            }
            Object.defineProperty(this, "ƒ" + key, { value: this[key], writable: true });
            Object.defineProperty(this, key, { get: get, set: set });

          }
        }
      }
    }
  }

  @ƒ.serialize @logged
  export class CharacterController extends ƒ.ComponentScript {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(CharacterController);

    @logged
    private state: "idle" | "move" | "jump" | "fall" = "idle";

    private walkSpeed: number = 1.5;
    private runSpeed: number = 5;
    private cmpAnimation: ƒ.ComponentAnimation;
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

    #idling: ƒ.AnimationNode;
    #walking: ƒ.AnimationNode;
    #running: ƒ.AnimationNode;
    #moving: ƒ.AnimationNode;
    #jumping: ƒ.AnimationNode;
    #falling: ƒ.AnimationNode;
    #sheathing: ƒ.AnimationNode;

    #layerBase: ƒ.AnimationLayer;
    #layerUpper: ƒ.AnimationLayer;

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

      this.cmpAnimation = this.node.getComponent(ƒ.ComponentAnimation);
      this.cmpRigidbody = this.node.getComponent(ƒ.ComponentRigidbody);
      this.cmpRigidbody.effectRotation = ƒ.Vector3.ZERO();


      this.#idling = new ƒ.AnimationNode(this.animationIdling, { weight: 1 });
      this.#walking = new ƒ.AnimationNode(this.animationWalking, { weight: 1 });
      this.#running = new ƒ.AnimationNode(this.animationRunning, { weight: 0 });
      this.#moving = new ƒ.AnimationNode([this.#walking, this.#running], { speed: 1 });
      this.#jumping = new ƒ.AnimationNode(this.animationJumping, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE });
      this.#falling = new ƒ.AnimationNode(this.animationFalling, { weight: 1 });
      this.#sheathing = new ƒ.AnimationNode(this.animationSheathing, { weight: 1, playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE });

      this.#layerBase = new ƒ.AnimationLayer(this.#idling, { weight: 1 });
      this.#layerUpper = new ƒ.AnimationLayer({}, { weight: 1 });
      this.cmpAnimation.branch = new ƒ.AnimationLayers([this.#layerBase, this.#layerUpper]);

      document.onkeydown = (_event: KeyboardEvent) => {
        switch (_event.code) {
          case ƒ.KEYBOARD_CODE.E:
            if (this.#layerUpper.isPlaying(this.#sheathing))
              return;

            this.#layerUpper.transit(this.#sheathing, 300);

            ƒ.Time.game.setTimer(0.8 * this.animationSheathing.totalTime, 1, () => {
              this.#layerUpper.transit({}, 300);
            });
            break;
          case ƒ.KEYBOARD_CODE.Q:
            this.#layerUpper.transit({}, 200);
            break;

          case ƒ.KEYBOARD_CODE.SPACE:
            if (!this.#grounded || this.state == "jump")
              return;

            let velocity: ƒ.Vector3 = this.cmpRigidbody.getVelocity();
            velocity.y = 5;
            this.cmpRigidbody.setVelocity(velocity);
            this.#grounded = false;
            this.#layerBase.transit(this.#jumping, 200);
            this.state = "jump";
            break;
        }
      }

      ƒ.Debug.groupEnd();
    }

    public update = (): void => {
      const deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
      // const wasMoving: boolean = this.#input.magnitudeSquared > 0;

      this.#input.x = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
      this.#input.y = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);

      const isMoving: boolean = this.#input.magnitudeSquared > 0;
      // const wasGrounded: boolean = this.#grounded;

      if (this.state != "jump") {
        let rayHitInfo: ƒ.RayHitInfo = ƒ.Physics.raycast(ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(0, 0.1, 0)), ƒ.Vector3.Y(-1), 0.15, true);
        this.#grounded = rayHitInfo.hit;
      }

      if (!this.#grounded && this.state != "fall" && this.cmpRigidbody.getVelocity().y < 0) {
        this.#layerBase.transit(this.#falling, this.state == "jump" ? 1000 : 300);
        this.state = "fall";
      } if (this.state != "move" && this.#grounded && isMoving) {
        this.#layerBase.transit(this.#moving, 200, 300);
        this.state = "move";
      } else if (this.state != "idle" && this.#grounded && !isMoving) {
        this.#layerBase.transit(this.#idling, 200);
        this.state = "idle";
      }

      let acceleration: number = 0;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) && isMoving)
        acceleration = 4;
      else if (this.#speed > this.walkSpeed)
        acceleration = -4;

      this.#speed = ƒ.Calc.clamp(this.#speed + acceleration * deltaTime, this.walkSpeed, this.runSpeed);
      this.#running.weight = (this.#speed - this.walkSpeed) / (this.runSpeed - this.walkSpeed);
      let animationSpeed: number = 1 + this.#running.weight * this.animationRunning.totalTime / this.animationWalking.totalTime;
      this.#walking.speed = this.#running.speed  = animationSpeed;

      // this.#moving.speed = 1 + this.#running.weight * this.animationRunning.totalTime / this.animationWalking.totalTime;

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

    private velocity: ƒ.Vector3 = ƒ.Vector3.ZERO();


    @ƒ.serialize(ƒ.Node)
    public target: ƒ.Node;

    public readonly axisX: ƒ.Axis = new ƒ.Axis("RotateX", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisY: ƒ.Axis = new ƒ.Axis("RotateY", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);

    private cmpCamera: ƒ.ComponentCamera;

    #target: ƒ.Vector3 = ƒ.Vector3.ZERO();
    #velocity: ƒ.Vector3 = ƒ.Vector3.ZERO();

    #lastPos: ƒ.Vector3 = ƒ.Vector3.ZERO();
    #time: number = 0;

    public constructor() {
      super();
      this.addEventListener("update", this.start, { once: true });
      this.addEventListener("update", this.update);
    }

    public start = (): void => {
      ƒ.Debug.group(this.constructor.name + " Start")
      this.cmpCamera = this.node.getComponent(ƒ.ComponentCamera);
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
      let cmpAnimation: ƒ.ComponentAnimation = this.node.getComponent(ƒ.ComponentAnimation) ?? new ƒ.ComponentAnimation();
      let aNodeX: ƒ.AnimationNode = new ƒ.AnimationNode(this.animationX);
      let aNodeY: ƒ.AnimationNode = new ƒ.AnimationNode(this.animationY);
      let layers: ƒ.AnimationLayers = new ƒ.AnimationLayers([new ƒ.AnimationLayer(aNodeX, { weight: 1 }), new ƒ.AnimationLayer(aNodeY, { weight: 0.5 })]);
      cmpAnimation.branch = layers;
      ƒ.Debug.groupEnd();
    }
  }



  // export class CustomComponentScript extends ƒ.ComponentScript {
  //   // Register the script as component for use in the editor via drag&drop
  //   public static readonly iSubclass: number = ƒ.Component.registerSubclass(CustomComponentScript);
  //   // Properties may be mutated by users in the editor via the automatically created user interface
  //   public message: string = "CustomComponentScript added to ";


  //   constructor() {
  //     super();

  //     // Don't start when running in editor
  //     if (ƒ.Project.mode == ƒ.MODE.EDITOR)
  //       return;

  //     // Listen to this component being added to or removed from a node
  //     this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
  //     this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
  //     this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
  //   }

  //   // Activate the functions of this component as response to events
  //   public hndEvent = (_event: Event): void => {
  //     switch (_event.type) {
  //       case ƒ.EVENT.COMPONENT_ADD:
  //         ƒ.Debug.log(this.message, this.node);
  //         break;
  //       case ƒ.EVENT.COMPONENT_REMOVE:
  //         this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
  //         this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
  //         break;
  //       case ƒ.EVENT.NODE_DESERIALIZED:
  //         // if deserialized the node is now fully reconstructed and access to all its components and children is possible
  //         break;
  //     }
  //   }

  //   // protected reduceMutator(_mutator: ƒ.Mutator): void {
  //   //   // delete properties that should not be mutated
  //   //   // undefined properties and private fields (#) will not be included by default
  //   // }
  // }
}