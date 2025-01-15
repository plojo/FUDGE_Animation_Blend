"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    window.addEventListener("load", start);
    let viewport;
    let cntMouseHorizontal = new ƒ.Control("MouseHorizontal", 1);
    let cntMouseVertical = new ƒ.Control("MouseVertical", -1);
    async function start() {
        // let q: ƒ.Quaternion = ƒ.Quaternion.ROTATION(new ƒ.Vector3(90, 0, 0));
        // q.power(0.5);
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // get the graph to show from loaded resources
        let graph = ƒ.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        ƒ.Debug.log("Graph:", graph);
        // setup the viewport
        let cmpCamera;
        for (const node of graph) {
            cmpCamera = node.getComponent(ƒ.ComponentCamera);
            if (cmpCamera)
                break;
        }
        let ctrCamera = cmpCamera.node.getComponent(Script.CameraController);
        ctrCamera.axisX.addControl(cntMouseHorizontal);
        ctrCamera.axisY.addControl(cntMouseVertical);
        document.addEventListener("pointermove", hndPointerMove);
        let canvas = document.querySelector("canvas");
        viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;
        viewport.gizmosEnabled = true;
        ƒ.Debug.log("Viewport:", viewport);
        // ƒ.Time.game.setScale(0.25);
        canvas.onpointerdown = (_event) => { if (_event.button == 2)
            canvas.requestPointerLock(); };
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        const updateEvent = new CustomEvent("update");
        for (const node of viewport.getBranch()) {
            for (const component of node.getAllComponents()) {
                component.dispatchEvent(updateEvent);
            }
        }
        ƒ.Physics.simulate(); // if physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();
    }
    function hndPointerMove(_event) {
        cntMouseHorizontal.setInput(_event.movementX);
        cntMouseVertical.setInput(_event.movementY);
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let CharacterController = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = ƒ.ComponentScript;
        let _camera_decorators;
        let _camera_initializers = [];
        let _camera_extraInitializers = [];
        let _animationIdling_decorators;
        let _animationIdling_initializers = [];
        let _animationIdling_extraInitializers = [];
        let _animationWalking_decorators;
        let _animationWalking_initializers = [];
        let _animationWalking_extraInitializers = [];
        let _animationRunning_decorators;
        let _animationRunning_initializers = [];
        let _animationRunning_extraInitializers = [];
        let _animationJumping_decorators;
        let _animationJumping_initializers = [];
        let _animationJumping_extraInitializers = [];
        let _animationFalling_decorators;
        let _animationFalling_initializers = [];
        let _animationFalling_extraInitializers = [];
        let _animationSheathing_decorators;
        let _animationSheathing_initializers = [];
        let _animationSheathing_extraInitializers = [];
        var CharacterController = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _camera_decorators = [ƒ.serialize(ƒ.Node)];
                _animationIdling_decorators = [ƒ.serialize(ƒ.Animation)];
                _animationWalking_decorators = [ƒ.serialize(ƒ.Animation)];
                _animationRunning_decorators = [ƒ.serialize(ƒ.Animation)];
                _animationJumping_decorators = [ƒ.serialize(ƒ.Animation)];
                _animationFalling_decorators = [ƒ.serialize(ƒ.Animation)];
                _animationSheathing_decorators = [ƒ.serialize(ƒ.Animation)];
                __esDecorate(null, null, _camera_decorators, { kind: "field", name: "camera", static: false, private: false, access: { has: obj => "camera" in obj, get: obj => obj.camera, set: (obj, value) => { obj.camera = value; } }, metadata: _metadata }, _camera_initializers, _camera_extraInitializers);
                __esDecorate(null, null, _animationIdling_decorators, { kind: "field", name: "animationIdling", static: false, private: false, access: { has: obj => "animationIdling" in obj, get: obj => obj.animationIdling, set: (obj, value) => { obj.animationIdling = value; } }, metadata: _metadata }, _animationIdling_initializers, _animationIdling_extraInitializers);
                __esDecorate(null, null, _animationWalking_decorators, { kind: "field", name: "animationWalking", static: false, private: false, access: { has: obj => "animationWalking" in obj, get: obj => obj.animationWalking, set: (obj, value) => { obj.animationWalking = value; } }, metadata: _metadata }, _animationWalking_initializers, _animationWalking_extraInitializers);
                __esDecorate(null, null, _animationRunning_decorators, { kind: "field", name: "animationRunning", static: false, private: false, access: { has: obj => "animationRunning" in obj, get: obj => obj.animationRunning, set: (obj, value) => { obj.animationRunning = value; } }, metadata: _metadata }, _animationRunning_initializers, _animationRunning_extraInitializers);
                __esDecorate(null, null, _animationJumping_decorators, { kind: "field", name: "animationJumping", static: false, private: false, access: { has: obj => "animationJumping" in obj, get: obj => obj.animationJumping, set: (obj, value) => { obj.animationJumping = value; } }, metadata: _metadata }, _animationJumping_initializers, _animationJumping_extraInitializers);
                __esDecorate(null, null, _animationFalling_decorators, { kind: "field", name: "animationFalling", static: false, private: false, access: { has: obj => "animationFalling" in obj, get: obj => obj.animationFalling, set: (obj, value) => { obj.animationFalling = value; } }, metadata: _metadata }, _animationFalling_initializers, _animationFalling_extraInitializers);
                __esDecorate(null, null, _animationSheathing_decorators, { kind: "field", name: "animationSheathing", static: false, private: false, access: { has: obj => "animationSheathing" in obj, get: obj => obj.animationSheathing, set: (obj, value) => { obj.animationSheathing = value; } }, metadata: _metadata }, _animationSheathing_initializers, _animationSheathing_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CharacterController = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            }
            static { this.iSubclass = ƒ.Component.registerSubclass(CharacterController); }
            #empty;
            #idling;
            #walking;
            #running;
            #moving;
            #jumping;
            #falling;
            #sheathing;
            #layerBase;
            #layerUpper;
            #input;
            #speed;
            #grounded;
            constructor() {
                super();
                this.stateBody = "idle";
                this.stateUpper = "empty";
                this.walkSpeed = 1.5;
                this.runSpeed = 5;
                this.camera = __runInitializers(this, _camera_initializers, void 0);
                this.animationIdling = (__runInitializers(this, _camera_extraInitializers), __runInitializers(this, _animationIdling_initializers, void 0));
                this.animationWalking = (__runInitializers(this, _animationIdling_extraInitializers), __runInitializers(this, _animationWalking_initializers, void 0));
                this.animationRunning = (__runInitializers(this, _animationWalking_extraInitializers), __runInitializers(this, _animationRunning_initializers, void 0));
                this.animationJumping = (__runInitializers(this, _animationRunning_extraInitializers), __runInitializers(this, _animationJumping_initializers, void 0));
                this.animationFalling = (__runInitializers(this, _animationJumping_extraInitializers), __runInitializers(this, _animationFalling_initializers, void 0));
                this.animationSheathing = (__runInitializers(this, _animationFalling_extraInitializers), __runInitializers(this, _animationSheathing_initializers, void 0));
                this.#empty = __runInitializers(this, _animationSheathing_extraInitializers);
                this.#input = ƒ.Vector2.ZERO();
                this.#speed = this.walkSpeed;
                this.#grounded = true;
                this.start = () => {
                    ƒ.Debug.group(this.constructor.name + " Start");
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
                    document.onkeydown = (_event) => {
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
                                let velocity = this.cmpRigidbody.getVelocity();
                                velocity.y = 5;
                                this.cmpRigidbody.setVelocity(velocity);
                                this.#grounded = false;
                                this.#layerBase.transit(this.#jumping, 200);
                                this.stateBody = "jump";
                                break;
                        }
                    };
                    this.cmpAnimationGraph.addEventListener("sheathingend", () => {
                        if (this.stateUpper != "sheathe")
                            return;
                        this.stateUpper = "empty";
                        this.#layerUpper.transit(this.#empty, 300);
                    });
                    ƒ.Debug.groupEnd();
                };
                this.update = () => {
                    const deltaTime = ƒ.Loop.timeFrameGame / 1000;
                    // const wasMoving: boolean = this.#input.magnitudeSquared > 0;
                    this.#input.x = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
                    this.#input.y = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
                    const isMoving = this.#input.magnitudeSquared > 0;
                    // const wasGrounded: boolean = this.#grounded;
                    if (this.stateBody != "jump") {
                        let rayHitInfo = ƒ.Physics.raycast(ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(0, 0.1, 0)), ƒ.Vector3.Y(-1), 0.15, true);
                        this.#grounded = rayHitInfo.hit;
                    }
                    if (!this.#grounded && this.stateBody != "fall" && this.cmpRigidbody.getVelocity().y < 0) {
                        this.#layerBase.transit(this.#falling, this.stateBody == "jump" ? 1000 : 300);
                        this.stateBody = "fall";
                    }
                    if (this.stateBody != "move" && this.#grounded && isMoving) {
                        this.#layerBase.transit(this.#moving, 200);
                        this.stateBody = "move";
                    }
                    else if (this.stateBody != "idle" && this.#grounded && !isMoving) {
                        this.#layerBase.transit(this.#idling, 200);
                        this.stateBody = "idle";
                    }
                    let acceleration = 0;
                    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) && isMoving)
                        acceleration = 4;
                    else if (this.#speed > this.walkSpeed)
                        acceleration = -4;
                    this.#speed = ƒ.Calc.clamp(this.#speed + acceleration * deltaTime, this.walkSpeed, this.runSpeed);
                    this.#running.weight = (this.#speed - this.walkSpeed) / (this.runSpeed - this.walkSpeed);
                    let animationSpeed = 1 + this.#running.weight * this.#running.speed;
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
                    let velocity = ƒ.Vector3.SUM(forward, right);
                    let rotation = ƒ.Quaternion.ROTATION(velocity, ƒ.Vector3.Y()); // ƒ.Matrix4x4.LOOK_IN(this.node.mtxWorld.translation, velocity, ƒ.Vector3.Y()).rotation
                    if (ƒ.Quaternion.DOT(rotation, this.node.mtxWorld.quaternion) < 0)
                        rotation.negate();
                    this.cmpRigidbody.setRotation(ƒ.Quaternion.SLERP(this.node.mtxWorld.quaternion, rotation, 0.5));
                    velocity.scale(this.#speed);
                    velocity.y = this.cmpRigidbody.getVelocity().y;
                    this.cmpRigidbody.setVelocity(velocity);
                };
                this.addEventListener("update", this.start, { once: true });
                this.addEventListener("update", this.update);
            }
            static {
                __runInitializers(_classThis, _classExtraInitializers);
            }
        };
        return CharacterController = _classThis;
    })();
    Script.CharacterController = CharacterController;
    let CameraController = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = ƒ.ComponentScript;
        let _target_decorators;
        let _target_initializers = [];
        let _target_extraInitializers = [];
        var CameraController = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _target_decorators = [ƒ.serialize(ƒ.Node)];
                __esDecorate(null, null, _target_decorators, { kind: "field", name: "target", static: false, private: false, access: { has: obj => "target" in obj, get: obj => obj.target, set: (obj, value) => { obj.target = value; } }, metadata: _metadata }, _target_initializers, _target_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CameraController = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            }
            static { this.iSubclass = ƒ.Component.registerSubclass(CameraController); }
            #target;
            #velocity;
            #lastPos;
            constructor() {
                super();
                this.radius = 7; // Distance from target
                this.azimuth = 0; // Horizontal angle
                this.elevation = 45; // Vertical angle
                this.rotationSpeed = 30; // Degrees per second
                this.target = __runInitializers(this, _target_initializers, void 0);
                this.axisX = (__runInitializers(this, _target_extraInitializers), new ƒ.Axis("RotateX", 1, 0 /* ƒ.CONTROL_TYPE.PROPORTIONAL */));
                this.axisY = new ƒ.Axis("RotateY", 1, 0 /* ƒ.CONTROL_TYPE.PROPORTIONAL */);
                this.#target = ƒ.Vector3.ZERO();
                this.#velocity = ƒ.Vector3.ZERO();
                this.#lastPos = ƒ.Vector3.ZERO();
                this.start = () => {
                    ƒ.Debug.group(this.constructor.name + " Start");
                    this.axisX.addEventListener("output" /* ƒ.EVENT_CONTROL.OUTPUT */, _event => this.azimuth += _event.detail.output * this.rotationSpeed * ƒ.Loop.timeFrameReal / 1000);
                    this.axisY.addEventListener("output" /* ƒ.EVENT_CONTROL.OUTPUT */, _event => this.elevation = ƒ.Calc.clamp(this.elevation - _event.detail.output * this.rotationSpeed * ƒ.Loop.timeFrameReal / 1000, -85, // Limit looking up
                    85 // Limit looking down
                    ));
                    this.#target.copy(this.target.mtxWorld.translation);
                    ƒ.Debug.groupEnd();
                };
                this.update = () => {
                    let deltaTime = ƒ.Loop.timeFrameReal / 1000;
                    let smoothTime = 0.5 / 5; // smooth time = lag distance / maximum speed, i.e. at speed 5 the maximum lag distance is 0.5.
                    let target = this.target.mtxWorld.translation.clone;
                    target.y += 1;
                    this.#target = ƒ.Vector3.SMOOTHDAMP(this.#target, target, this.#velocity, smoothTime, deltaTime);
                    // console.log(this.#velocity.magnitude);
                    // Convert spherical to Cartesian coordinates
                    let rad = this.radius;
                    let theta = this.azimuth * Math.PI / 180;
                    let phi = this.elevation * Math.PI / 180;
                    // Calculate new camera position
                    let translation = this.node.mtxLocal.translation;
                    translation.x = this.#target.x + rad * Math.cos(phi) * Math.cos(theta);
                    translation.y = this.#target.y + rad * Math.sin(phi);
                    translation.z = this.#target.z + rad * Math.cos(phi) * Math.sin(theta);
                    this.node.mtxLocal.translation = translation;
                    this.node.mtxLocal.lookAt(this.#target, ƒ.Vector3.Y());
                    this.#lastPos.copy(this.target.mtxWorld.translation);
                };
                this.addEventListener("update", this.start, { once: true });
                this.addEventListener("update", this.update);
            }
            drawGizmos(_cmpCamera) {
                ƒ.Gizmos.drawSphere(ƒ.Matrix4x4.COMPOSITION(this.#target, undefined, ƒ.Vector3.ONE(0.05)), ƒ.Color.CSS("red"));
            }
            static {
                __runInitializers(_classThis, _classExtraInitializers);
            }
        };
        return CameraController = _classThis;
    })();
    Script.CameraController = CameraController;
    let CubeAnimator = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = ƒ.ComponentScript;
        let _animationX_decorators;
        let _animationX_initializers = [];
        let _animationX_extraInitializers = [];
        let _animationY_decorators;
        let _animationY_initializers = [];
        let _animationY_extraInitializers = [];
        var CubeAnimator = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _animationX_decorators = [ƒ.serialize(ƒ.Animation)];
                _animationY_decorators = [ƒ.serialize(ƒ.Animation)];
                __esDecorate(null, null, _animationX_decorators, { kind: "field", name: "animationX", static: false, private: false, access: { has: obj => "animationX" in obj, get: obj => obj.animationX, set: (obj, value) => { obj.animationX = value; } }, metadata: _metadata }, _animationX_initializers, _animationX_extraInitializers);
                __esDecorate(null, null, _animationY_decorators, { kind: "field", name: "animationY", static: false, private: false, access: { has: obj => "animationY" in obj, get: obj => obj.animationY, set: (obj, value) => { obj.animationY = value; } }, metadata: _metadata }, _animationY_initializers, _animationY_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CubeAnimator = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            constructor() {
                super();
                this.animationX = __runInitializers(this, _animationX_initializers, void 0);
                this.animationY = (__runInitializers(this, _animationX_extraInitializers), __runInitializers(this, _animationY_initializers, void 0));
                this.start = (__runInitializers(this, _animationY_extraInitializers), () => {
                    ƒ.Debug.group(this.constructor.name + " Start");
                    this.animationX = new ƒ.Animation("AnimationX");
                    let cmpAnimation = this.node.getComponent(ƒ.ComponentAnimationGraph);
                    let aNodeX = new ƒ.AnimationNodeAnimation(this.animationX);
                    let aNodeY = new ƒ.AnimationNodeAnimation(this.animationY, { weight: 0.5 });
                    let layers = new ƒ.AnimationNodeBlend([aNodeX, aNodeY]);
                    cmpAnimation.root = layers;
                    ƒ.Debug.groupEnd();
                });
                this.addEventListener("update", this.start, { once: true });
            }
        };
        return CubeAnimator = _classThis;
    })();
    Script.CubeAnimator = CubeAnimator;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map