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
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(10, 10, 20);
  camera.zoom = 5;
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("lightblue");

  //Sakktábla texture
  // {
  //   const planeSize = 4000;
  //   const loader = new THREE.TextureLoader();
  //   const texture = loader.load(
  //     "https://threejsfundamentals.org/threejs/resources/images/checker.png"
  //   );
  //   texture.wrapS = THREE.RepeatWrapping;
  //   texture.wrapT = THREE.RepeatWrapping;
  //   texture.magFilter = THREE.NearestFilter;
  //   const repeats = planeSize / 200;
  //   texture.repeat.set(repeats, repeats);
  //   const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
  //   const planeMat = new THREE.MeshPhongMaterial({
  //     map: texture,
  //     side: THREE.DoubleSide
  //   });
  //   var mesh = new THREE.Mesh(planeGeo, planeMat);
  //   mesh.rotation.x = Math.PI * 5;
  //   scene.add(mesh);
  // }


  // Add lights to the scene
  {
    const skyColor = 0xffffff; // light blue
    const groundColor = 0xffffff;
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

  ///////////////////////////////

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
  //Load field object
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
  /////////////////////////////////////////////////////////

  //Make sphere objects
  makeSphere(scene, 100, 150, 350);
  makeSphere(scene, 150, 170, 350);
  makeSphere(scene, 150, 70, 350);
  makeSphere(scene, 180, 110, 350);
  makeSphere(scene, 190, 160, 350);

  // resize canvas to display size
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
  //////////////////////////////////////////////
  // render canvas
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

//Random move 
function moveObject() {
  return Math.random() * 10 + Math.random() * 10;
}
//////////////////////////////////////

//Load sphere objects

function makeSphere(scene, x, y, z) {
  // Load sphere object from .obj+.mtl file
  // const objLoader = new THREE.OBJLoader2();
  // objLoader.loadMtl("./assets/sphere.mtl", null, materials => {
  //   objLoader.setMaterials(materials);
  //   objLoader.load("./assets/sphere.obj", event => {
  //     const root = event.detail.loaderRootNode;
  //     root.name = "sphere";
  //     root.position.x = x + 6;
  //     root.position.y = y + 6;
  //     root.position.z = z + 6;
  //     root.rotation.x = 1.5;
  //     root.scale.x = 1;
  //     root.scale.y = 1;
  //     root.scale.z = 1;
  //     scene.add(root);

  // Add sphere geometry from three.js
  var geometry = new THREE.SphereGeometry(5, 15, 15);
  // var material = new THREE.MeshLambertMaterial({
  //   color: "red",
  //   wireframe: true
  // });
  var material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color("yellow")
      },
      color2: {
        value: new THREE.Color("purple")
      }
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
    wireframe: true
  });
  var sphere = new THREE.Mesh(geometry, material);
  sphere.name = "sphere";
  sphere.position.x = x;
  sphere.position.y = y;
  sphere.position.z = z;
  sphere.rotation.x = 1.5;
  sphere.scale.x = 1;
  sphere.scale.y = 1;
  sphere.scale.z = 1;
  scene.add(sphere);
  setInterval(() => {
    positionSphere(sphere);
  }, 100);
  //   });
  // });
}
// delete object from scene

// function delete3DOBJ(objName, scene) {
//   var selectedObject = scene.getObjectByName(objName);
//   scene.remove(selectedObject);
// }

// random position sphere objects 
var sign = 1;

function positionSphere(sphere) {
  if (
    sphere.position.x >= 200 ||
    sphere.position.y >= 300 ||
    sphere.position.x <= 0 ||
    sphere.position.y <= 0
  ) {
    sign = sign * -1;
  }
  // root.position.x += sign * 1;
  // root.position.y += sign * 1.5;
  sphere.position.x += sign * 1;
  sphere.position.y += sign * 1.5;
}
////////////////////////////////////////////////////////////////

main();