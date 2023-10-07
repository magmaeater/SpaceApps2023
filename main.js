import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, canvas, pointer, textureLoader, raycaster;

const init = () => {
    function onPointerMove( event ) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
    
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    }

    function getLatLng(vector, radius) {
        let latRads = Math.acos(vector.y / radius);
        let lngRads = Math.atan2(vector.z, vector.x);
        let lat = (Math.PI / 2 - latRads) * (180 / Math.PI);
        let lng = (Math.PI - lngRads) * (180 / Math.PI);
        const coords = [lat, lng - 180]
        return coords;
    }

    async function getCountry(lat, long){
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},+${long}&key=b0806d8796334662b1891c2bd4cfe307&language=en&pretty=1`;
        try {
            const response = await fetch(url);
            const json = await response.json();
        
            if (json.results.length > 0) {
              return [json.results[0].components.country, json.results[0].components.continent];
            } else {
              return [-1, -1];
            }
          } catch (error) {
            console.error("Error:", error);
            return [-1, -1];
          }
    }

    function clickedEarth(){
        raycaster.setFromCamera(pointer, camera);
        let intersections = raycaster.intersectObjects(scene.children);
        for (let i = 0; i < intersections.length; i++) {
            if(intersections[i].object.name == "earth"){
                gltfLoader.load('static/pointed_pin.glb', (glb) => {
                    const root = glb.scene;
                    root.scale.set(0.005, 0.005, 0.005, 0.005);
                    root.color = 0xffffff;
                    root.position.x = intersections[i].point.x;
                    root.position.y = intersections[i].point.y;
                    root.position.z = intersections[i].point.z;
                    const [lat, long] = getLatLng({x: root.position.x, y: root.position.y, z: root.position.z}, 0.6371);
                    getCountry(lat, long).then((countryData)=>{
                        const [country, continent] = countryData;
                        //FIX THIS
                        if (country == -1 || continent == -1) {
                            console.log("The marked place is not a country!");
                        }
                        else{
                            console.log("country: " + country);
                            console.log("continent: " + continent);
                        }
                    });
                    if (intersections[i].point.x >= 0){
                        root.rotation.x -= Math.PI / 2;
                        
                    }
                    else{
                        root.rotation.x += Math.PI / 2;
                    }
                    scene.add(root);
                });
            }
        }
    }

    canvas = document.querySelector(".webgl");
    textureLoader = new THREE.TextureLoader();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 2;
    scene.add(camera);

    const controls = new OrbitControls(camera, canvas);
    const gltfLoader = new GLTFLoader();

    renderer = new THREE.WebGLRenderer({
        canvas:canvas,
        antialias:true
    });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x00000, 0.0);

    // EARTHHHHHHHHHHHHHHHHHHHHHHHH
    const earthGeometry = new THREE.SphereGeometry(0.6371, 32,32);
    const earthMaterial = new THREE.MeshStandardMaterial({
        metalness:0,
        map: textureLoader.load("static/8k_earth_daymap.jpg"),
        bumpMap: textureLoader.load("static/earthbump.jpg"),
        bumpScale: 0.3,
    })
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.name = "earth";
    scene.add(earthMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    //CLOUDS
    const cloudGeometry = new THREE.SphereGeometry(0.64, 32, 32);
    const cloudMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load("static/cloud.png"),
        transparent: true
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);


    const animate = () =>{
        requestAnimationFrame(animate);
        //earthMesh.rotation.y -= 0.0015;
        render();
    }

    const render = () => {
        renderer.render(scene, camera);
    }

    animate();
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("click", clickedEarth);
}

window.onload = init;