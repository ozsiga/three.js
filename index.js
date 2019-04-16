"use strict";

/* global THREE */

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas
  });
  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("lightblue");

  {
    const planeSize = 4000;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://threejsfundamentals.org/threejs/resources/images/checker.png"
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 200;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * 5;
    //scene.add(mesh);
  }

  {
    const skyColor = 0xffffff; // light blue
    const groundColor = 0xffffff; // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 1;
    const halfFovY = THREE.Math.degToRad(camera.fov * 3);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(0, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl(
      "./assets/Taliandorogd_terepmodell.mtl",
      null,
      materials => {
        objLoader.setMaterials(materials);
        objLoader.load("./assets/Taliandorogd_terepmodell.obj", event => {
          const root = event.detail.loaderRootNode;
          scene.add(root);

          // compute the box that contains all the stuff
          // from root and below
          const box = new THREE.Box3().setFromObject(root);

          const boxSize = box.getSize(new THREE.Vector3()).length();
          const boxCenter = box.getCenter(new THREE.Vector3());

          // set the camera to frame the box
          frameArea(boxSize * 1.7, boxSize, boxCenter, camera);

          // update the Trackball controls to handle the new size
          controls.maxDistance = boxSize * 10;
          controls.target.copy(boxCenter);
          controls.update();
        });
      }
    );
  }

  //   {
  //     const objLoader = new THREE.OBJLoader2();
  //     objLoader.loadMtl("./assets/sphere.mtl", null, materials => {
  //       objLoader.setMaterials(materials);
  //       objLoader.load("./assets/sphere.obj", event => {
  //         const root = event.detail.loaderRootNode;
  //         root.position.x = 100 + moveObject();
  //         root.position.y = 150;
  //         root.position.z = 350;
  //         root.rotation.x = 1.5;
  //         root.scale.x = 1;
  //         root.scale.y = 1;
  //         root.scale.z = 1;
  //         scene.add(root);
  //       });
  //     });
  //   }

  makeSphere(scene, 100, 150, 350);
  makeSphere(scene, 150, 170, 350);
  makeSphere(scene, 150, 70, 350);
  makeSphere(scene, 180, 110, 350);
  makeSphere(scene, 190, 160, 350);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
///////////////////////////////////////////////////////////////
function moveObject() {
  return Math.random() * 10 + Math.random() * 10;
}
function makeSphere(scene, x, y, z) {
  const objLoader = new THREE.OBJLoader2();
  objLoader.loadMtl("./assets/sphere.mtl", null, materials => {
    objLoader.setMaterials(materials);
    objLoader.load("./assets/sphere.obj", event => {
      const root = event.detail.loaderRootNode;
      root.name = "sphere";
      root.position.x = x + 6;
      root.position.y = y + 6;
      root.position.z = z + 6;
      root.rotation.x = 1.5;
      root.scale.x = 1;
      root.scale.y = 1;
      root.scale.z = 1;
      scene.add(root);
      setInterval(() => {
        positionSphere(root, sphere);
      }, 100);
      var geometry = new THREE.SphereGeometry(5, 32, 32);
      var material = new THREE.MeshNormalMaterial({
        color: "red",
        //lights: true,
        //alphaMap: "white",
        wireframe: true
      });
      console.log(material);
      // material.setValues({ lights: true });
      var sphere = new THREE.Mesh(geometry, material);
      root.name = "sphere";
      sphere.position.x = x;
      sphere.position.y = y;
      sphere.position.z = z;
      sphere.rotation.x = 1.5;
      sphere.scale.x = 1;
      sphere.scale.y = 1;
      sphere.scale.z = 1;
      scene.add(sphere);
    });
  });
}

function delete3DOBJ(objName, scene) {
  var selectedObject = scene.getObjectByName(objName);
  scene.remove(selectedObject);
}

var sign = 1;

function positionSphere(root, sphere) {
  if (
    root.position.x >= 200 ||
    root.position.y >= 300 ||
    root.position.x <= 0 ||
    root.position.y <= 0
  ) {
    sign = sign * -1;
  }
  root.position.x += sign * 1;
  root.position.y += sign * 1.5;
  sphere.position.x += sign * 1;
  sphere.position.y += sign * 1.5;

  //console.log(root.position.x, root.position.y);
}
////////////////////////////////////////////////////////////////

main();
