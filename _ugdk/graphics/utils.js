import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {Box3, LoadingManager, PointsMaterial, REVISION, Vector3} from "three";
import {DRACOLoader, KTX2Loader} from "three/addons";
import {MeshoptDecoder} from "three/addons/libs/meshopt_decoder.module.js";
import {getShape} from "./threejsMeshTemplates";

export function getTestCube(color = 0x00ff00) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({color: color});
    return new THREE.Mesh(geometry, material)
}

export function getTransformsCube(json) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
    const mesh=  new THREE.Mesh(geometry, material)
    return mesh
}

export function get3DLoadingMesh(){
    return getTransformsCube({})
}

export function get3JSObject(json,){
    if(json.ref.startsWith('threejs://')){
        const shape = getShape(json.ref)
        const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        return new THREE.Mesh(shape, material)
    }else if(json.ref.startsWith('https://')){
        return getTransformsCube(json)
    }else{
        return getTransformsCube(json)
    }
}

export function getGLTFObject(json, loader, callback){
    // console.log(json)
    if(json.ref.startsWith('threejs://')){
        callback(getTransformsCube(json))
        return getTransformsCube(json)
    }else if(json.ref.startsWith('https://')){
        loadRemoteModel(loader, callback)
        return getTransformsCube(json)
    }else{
        return getTransformsCube(json)
    }


}
export function getRemoteGLTB(scene, camera, renderer) {
    const loader = new GLTFLoader();
    const MANAGER = new LoadingManager();

    const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
        `https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs/draco/gltf/`,
    );
    const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
        `https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs/basis/`,
    );

    loader.setCrossOrigin('anonymous')
        .setDRACOLoader(DRACO_LOADER)
        .setKTX2Loader(KTX2_LOADER.detectSupport(renderer))
        .setMeshoptDecoder(MeshoptDecoder);
    // URL.createObjectURL(rootFile)

    loader.load( 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb', function ( gltf ) {

        console.log(gltf)
        const toy = gltf.scene
        toy.updateMatrixWorld();

        const box = new Box3().setFromObject(toy);
        const size = box.getSize(new Vector3()).length();
        const center = box.getCenter(new Vector3());

        toy.position.x -= center.x;
        toy.position.y -= center.y;
        toy.position.z -= center.z;


        camera.lookAt( toy )
        camera.near = size / 100;
        camera.far = size * 100;
        camera.updateProjectionMatrix();
        camera.position.copy(center);
        camera.position.x += size / 2.0;
        camera.position.y += size / 5.0;
        camera.position.z += size / 2.0;
        camera.lookAt(center);
        scene.add( toy );

        //Materials
        toy.traverse((node) => {
            if (!node.geometry) return;
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach( material => {
                material.wireframe = false;

                if (material instanceof PointsMaterial) {
                    material.size = 1.0;
                }
            });
        });

    }, function (params) {
        // console.log(params)
    }, function ( error ) {

        console.error( "[getRemoteGLTB].error",error );

    } );
}

export function loadRemoteModel(loader, callback){
    loader.load('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb',
        callback)

}


