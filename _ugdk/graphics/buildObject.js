import * as THREE from "three";
import {AmbientLight, DirectionalLight, HemisphereLight} from "three";
import {get3DLoadingMesh, getTransformsCube, loadRemoteModel} from "./utils";

export default {

    buildCamera(json, cameraAvailable) {
        const fov = json.fov
        const aspect = json.aspect
        const nearOcclusion = json.nearOcclusion
        const farOcclusion = json.farOcclusion
        const array_count = json.array_count

        const left = 50
        const right = 50
        const top = 50
        const bottom = 50

        if (json.type === "array") {
            const cam_array = []
            for (let i = 0; i < array_count; i++) {
                cam_array.push(new THREE.PerspectiveCamera(fov, aspect, nearOcclusion, farOcclusion))
            }
            cameraAvailable(cam_array)
            return cam_array
        }
        if (json.type === "cube") {
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
                generateMipmaps: true,
                minFilter: THREE.LinearMipmapLinearFilter
            });
            const camera = new THREE.CubeCamera(nearOcclusion, farOcclusion, cubeRenderTarget);
            cameraAvailable(camera)
            return camera
        }
        if (json.type === "orthographic") {
            const camera = new THREE.OrthographicCamera(left, right, top, bottom, nearOcclusion, farOcclusion);
            cameraAvailable(camera)
            return camera
        }
        if (json.type === "perspective") {
            const camera = new THREE.PerspectiveCamera(fov, aspect, nearOcclusion, farOcclusion);
            cameraAvailable(camera)
            return camera
        }
        if (json.type === "stereo") {
            const camera = new THREE.StereoCamera();
            cameraAvailable(camera)
            return camera
        }
    },

    buildLight(json, lightAvailable) {
        if (json.type === "hemishpere") {
            const light = new HemisphereLight();
            light.name = json.label;
            lightAvailable(light)
            return light
        } else if (json.type === "ambient") {
            const light = new AmbientLight('#FFFFFF', 0.3);
            light.name = json.label;
            lightAvailable(light)
            return light
        } else if (json.type === "directional") {
            const light = new DirectionalLight('#FFFFFF', 0.8 * Math.PI);
            light.name = json.label;
            lightAvailable(light)
            return light
        }
    },

    buildAudio(json, audioAvailable) {

    },

    build3DMeshGroup(json, loader, meshGroupAvailable) {
        if (json.ref.startsWith('threejs://')) {
            meshGroupAvailable(getTransformsCube(json))
        } else if (json.ref.startsWith('https://')) {
            // meshGroupAvailable(get3DLoadingMesh())
            loadRemoteModel(loader, meshGroupAvailable)
        } else {
            meshGroupAvailable(getTransformsCube(json))
        }
    }


}