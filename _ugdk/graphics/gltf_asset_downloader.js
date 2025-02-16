import {LoadingManager, REVISION} from "three";
import {DRACOLoader, KTX2Loader} from "three/addons";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {MeshoptDecoder} from "three/addons/libs/meshopt_decoder.module.js";

const MANAGER = new LoadingManager();

const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(`https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs/draco/gltf/`,);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(`https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs/basis/`,);
const loader = new GLTFLoader();
loader.setCrossOrigin('anonymous')
    .setDRACOLoader(DRACO_LOADER)
    // .setKTX2Loader(KTX2_LOADER.detectSupport(renderer))
    .setMeshoptDecoder(MeshoptDecoder);

export default {
    download_gltf_asset: (cache, cache2, model3D,onDownloadComplete, onDownloadUpdate, onDownloadStart, onError,) => {
        onDownloadStart()
        if(model3D.ref.startsWith('threejs://')){
            cache[model3D.ref] = {}
            cache2[model3D.ref] = {}
            onDownloadComplete(model3D, {})
            return
        }
        loader.load(model3D.ref, function (gltf) {
            cache[model3D.ref] = gltf
            cache2[model3D.ref] = gltf
            onDownloadComplete(model3D, gltf)
        }, onDownloadUpdate, onError)
    },

}
