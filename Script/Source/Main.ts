namespace Script {
  import ƒ = FudgeCore;

  window.addEventListener("load", start);

  let viewport: ƒ.Viewport;
  let cntMouseHorizontal: ƒ.Control = new ƒ.Control("MouseHorizontal", 1);
  let cntMouseVertical: ƒ.Control = new ƒ.Control("MouseVertical", -1);

  async function start(): Promise<void> {
    // let q: ƒ.Quaternion = ƒ.Quaternion.ROTATION(new ƒ.Vector3(90, 0, 0));
    // q.power(0.5);

    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", ƒ.Project.resources);

    // get the graph to show from loaded resources
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
    ƒ.Debug.log("Graph:", graph);

    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera;
    for (const node of graph) {
      cmpCamera = node.getComponent(ƒ.ComponentCamera);
      if (cmpCamera) 
        break;
    }

    let ctrCamera: CameraController = cmpCamera.node.getComponent(CameraController)
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
    canvas.onpointerdown = (_event) => {if (_event.button == 2 )canvas.requestPointerLock();}

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    const updateEvent: CustomEvent = new CustomEvent("update");
    for (const node of viewport.getBranch()) {
      for (const component of node.getAllComponents()) {
        component.dispatchEvent(updateEvent);
      }
    }
    ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }

  function hndPointerMove(_event: PointerEvent): void {
    cntMouseHorizontal.setInput(_event.movementX);
    cntMouseVertical.setInput(_event.movementY);
  }
}