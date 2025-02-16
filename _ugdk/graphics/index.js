import {MeshoptDecoder} from "three/addons/libs/meshopt_decoder.module.js";
import * as THREE from "three";
import {
    AnimationMixer, Clock,
    Color,
    Group,
    LinearToneMapping,
    LoadingManager,
    PMREMGenerator,
    REVISION,
    Vector3
} from "three";
import {DRACOLoader, KTX2Loader, RoomEnvironment} from "three/addons";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import buildObject from "./buildObject";
import {get3JSObject, getGLTFObject} from "./utils";
import gltf_asset_downloader from "./gltf_asset_downloader";

const MANAGER = new LoadingManager();

const DRACO_LOADER = new DRACOLoader(MANAGER)
    .setDecoderPath(`https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs/draco/gltf/`,);
const KTX2_LOADER = new KTX2Loader(MANAGER)
    .setTranscoderPath(`https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs/basis/`,);
const loader = new GLTFLoader();

let THREEJS_CACHE = {} // Map of original key to constructed 3js object
let SCENE_OBJECTS_SCHEMA_COPY = {}  //Snapshot Copy of Scene Schema
let SCENE_OBJECTS_SCHEMA_REF = {}  //Reference to original data map

const clock = new Clock(); //THREE.Clock

export function composeScene(sceneSchema) {
    SCENE_OBJECTS_SCHEMA_COPY = JSON.parse(JSON.stringify(sceneSchema.objects))
    SCENE_OBJECTS_SCHEMA_REF = sceneSchema.objects

    const renderer = THREEJS_CACHE['default_renderer'] = getRenderer()

    reconstruct3JSObjectsFromJsonSchema(sceneSchema, THREEJS_CACHE)

    setActiveCamera(sceneSchema, THREEJS_CACHE)

    loader.setCrossOrigin('anonymous')
        .setDRACOLoader(DRACO_LOADER)
        .setKTX2Loader(KTX2_LOADER.detectSupport(renderer))
        .setMeshoptDecoder(MeshoptDecoder);

    return {renderer: THREEJS_CACHE['default_renderer'], scene: THREEJS_CACHE['scene'], camera: THREEJS_CACHE['active_camera'], THREEJS_CACHE}
}

function getRenderer(){
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xcccccc);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = Number(LinearToneMapping);
    renderer.toneMappingExposure = Math.pow(2, 0.0);
    return renderer
}

export function reconstruct3JSObjectsFromJsonSchema(json_schema, _THREEJS_CACHE) {
    //construct scene, the root node
    const scene_config = json_schema.scene_config
    const scene_bg = scene_config.background

    const scene = new THREE.Scene();
    const helpersGroup = new Group()
    const sceneElementsGroup = new Group()

    scene.background = new Color(scene_bg.r, scene_bg.g, scene_bg.b)
    const pmremGenerator = new PMREMGenerator(_THREEJS_CACHE['default_renderer']);
    pmremGenerator.compileEquirectangularShader();
    const neutralEnvironment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    // scene.background = neutralEnvironment
    // scene.environment = neutralEnvironment

    scene.add(helpersGroup)
    scene.add(sceneElementsGroup)
    _THREEJS_CACHE['scene.object_node'] = sceneElementsGroup
    _THREEJS_CACHE['helpers.object_node'] = helpersGroup
    _THREEJS_CACHE['scene'] = scene

    const sceneElements = json_schema.objects
    console.log(sceneElements, "LLLLLLLLLLLL")

    Object.keys(sceneElements).forEach((key, position) =>
        {
            const object_node = getObjectGroupNode(key)
            const element = sceneElements[key];
            /* *
             * Handle new element
             * */

            //Check and add 3d model object
            const model3d_type = element?.model3D?.ref ?? false
            if (model3d_type && !THREEJS_CACHE[`${key}.mesh`]) {
                THREEJS_CACHE[`${key}.mesh`] = get3JSObject(element?.model3D)
                THREEJS_CACHE[`${key}.mesh`].scene_object_key = key
                THREEJS_CACHE[`${key}.mesh`].updateMatrixWorld();
                object_node.add(THREEJS_CACHE[`${key}.mesh`])
                if(element?.model3D?.ref.startsWith('https://')) {
                    gltf_asset_downloader.download_gltf_asset({}, {}, element?.model3D,  function (meta, gltf) {
                        const placeholder = THREEJS_CACHE[`${key}.mesh`]
                        const toy = gltf.scene
                        toy.updateMatrixWorld() // donmccurdy/three-gltf-viewer#330
                        toy.position.copy(placeholder.position)
                        toy.rotation.copy(placeholder.rotation)
                        toy.scale.copy(placeholder.scale)

                        THREEJS_CACHE[`${key}.mesh`].removeFromParent()
                        THREEJS_CACHE[`${key}.mesh`] = toy
                        THREEJS_CACHE[`${key}.mesh`].scene_object_key = key
                        object_node.add(THREEJS_CACHE[`${key}.mesh`])
                        THREEJS_CACHE['default_renderer'].render( THREEJS_CACHE['scene'], THREEJS_CACHE['active_camera'])

                        if(gltf.animations.length > 0){ // Paid Mode
                            let animationMixer = new AnimationMixer(toy)
                            animationMixer.clipAction( gltf.animations[0] ).play()
                            THREEJS_CACHE[`${key}.animation`] = animationMixer
                            let animation_queue = THREEJS_CACHE[`animation.queue`]// = animationMixer

                            if(animation_queue == null){
                                console.error("Creating New Animation Queue")
                                THREEJS_CACHE[`animation.queue`] = []

                                THREEJS_CACHE['default_renderer'].setAnimationLoop(() => {
                                    const delta = clock.getDelta();
                                    THREEJS_CACHE[`animation.queue`].forEach( (mixer) => {

                                        mixer.update(delta)

                                    } )
                                    THREEJS_CACHE['default_renderer'].render( THREEJS_CACHE['scene'], THREEJS_CACHE['active_camera'])
                                })
                            }

                            THREEJS_CACHE[`animation.queue`].push(THREEJS_CACHE[`${key}.animation`])
                        }

                    }, ()=>{}, ()=>{}, ()=>{})
                }
            }

            //update camera
            const camera_type = element?.camera?.type ?? false
            if (camera_type && !THREEJS_CACHE[`${key}.camera`]) {
                THREEJS_CACHE[`${key}.camera`] = buildObject.buildCamera(element.camera, function (cam) {
                })
                object_node.add(THREEJS_CACHE[`${key}.camera`])
            }

            //update light
            const light_type = element?.light?.type ?? false
            if (light_type && !THREEJS_CACHE[`${key}.light`]) {
                THREEJS_CACHE[`${key}.light`] = buildObject.buildLight(element.light, function (cam) {
                })
                object_node.add(THREEJS_CACHE[`${key}.light`])
            }

            //update audio
            const audio_type = element?.audio?.type ?? false
            if (audio_type && !THREEJS_CACHE[`${key}.audio`]) {
                THREEJS_CACHE[`${key}.audio`] = buildObject.buildAudio(element.audio, function (cam) {
                })
                //object_node.add(THREEJS_CACHE[`${key}.audio`])
            }

            //Update Transforms
            if(element.position) {
                object_node.position.x = element.position.x
                object_node.position.y = element.position.y
                object_node.position.z = element.position.z
            }

            if(element.rotation) {
                object_node.rotation.x = element.rotation.x
                object_node.rotation.y = element.rotation.y
                object_node.rotation.z = element.rotation.z
            }

            if(element.scale) {
                object_node.scale.x = element.scale.x
                object_node.scale.y = element.scale.y
                object_node.scale.z = element.scale.z
            }

            const parent_key = element.parent
            if (!parent_key) {
                return
            }

            const parent_node = getObjectGroupNode(parent_key) //gets or creates parent node.
            parent_node.id_generated = key
            parent_node.add(object_node) //add to new parent, automatically removes object node from former parent

        }
    )

    console.log(scene)
}

export function setActiveCamera(json_schema, _THREEJS_CACHE) {

    const active_camera_key = json_schema.objects.default_renderer.active_camera
    const camera_key = `${active_camera_key}.camera`
    const threejs_object_camera_instance = _THREEJS_CACHE[`${camera_key}`]

    const object_schema_camera_data = json_schema.objects[active_camera_key]

    if (!threejs_object_camera_instance) {
        //Object with `active_camera_key` does not exist
        console.log(`Object with ${active_camera_key}.camera does not exist`)
        return
    }

    const cam_position = object_schema_camera_data.position
    const cam_rotation = object_schema_camera_data.rotation
    console.log("cam_rotation", cam_rotation)
    _THREEJS_CACHE['active_camera'] = _THREEJS_CACHE[`${active_camera_key}.camera`]


}

function getObjectGroupNode(key) {
    const group_node = THREEJS_CACHE[`${key}.object_node`]
    if (group_node) {
        return group_node
    }
    return THREEJS_CACHE[`${key}.object_node`] = new Group()
}
