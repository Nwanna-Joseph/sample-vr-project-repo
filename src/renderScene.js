import {VRButton} from "three/addons";
import {composeScene} from "ugdk/graphics";

export default async function renderScene(scene_meta) { //move to ugdk

    // const scene_data = scene_file.scenes.data[scene_file.scenes.selected].init
    const active_scene = scene_meta.scenes_defaults.active
    const scene_data = scene_meta.scenes[active_scene]

    // console.log(scene_data)

    const rect = document.body.getBoundingClientRect();
    const width = window.innerWidth //rect.width;
    const height = window.innerHeight// rect.height ;
    // console.log(window.innerWidth, window.innerHeight)

    // const {renderer, scene, camera} = createScene(scene_data, 1000, 600)
    const {renderer, scene, camera, THREEJS_CACHE} = composeScene(scene_data)

    THREEJS_CACHE['default_renderer'].setSize(width, height) //We can rescale as we deem fit
    THREEJS_CACHE['active_camera'].aspect = width/height;
    THREEJS_CACHE['active_camera'].updateProjectionMatrix();

    const scr = {scene, camera, renderer}

    function animate() {
        document.dispatchEvent(new CustomEvent('on_new_frame_render', {
            detail: 'This is a custom event',
        }));

        // onGameUpdate(scene_data.objects, THREEJS_CACHE, global_var, input_devices, scr)
        renderer.render(THREEJS_CACHE['scene'], THREEJS_CACHE['active_camera']);

        document.dispatchEvent(new CustomEvent('on_post_frame_render', {
            detail: 'This is a custom event',
        }));
    }

    // loadEagerAssets()

    // addObjects(scene, gameObjects, constructedGameObjects)
    // reconstruct3JSObjectsFromJsonSchema(sceneSchema, THREEJS_CACHE)


    // onInit(scene_data.objects, THREEJS_CACHE, input_devices, global_var, scr).then( res => {
    //     console.log(THREEJS_CACHE)
    //     renderer.setAnimationLoop(animate);
    // })

    renderer.setAnimationLoop(animate);


    // loadLazyAssets()

    renderer.xr.enabled = true;
    document.body.innerHTML = "" //https://medium.com/@gamechefio/how-to-enable-webxr-in-an-iframe-in-react-509759f18125
    document.body.appendChild(renderer.domElement);
    document.body.appendChild( VRButton.createButton( renderer ) );
}