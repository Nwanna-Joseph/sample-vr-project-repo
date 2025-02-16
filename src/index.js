import mode from "./mode";
import getParams from "./get_params";
import renderScene from "./renderScene";

const openScene = async (scene) => {
    try {
        await renderScene(scene)
    } catch (e) {
        console.error(e)
    }
}

const enableDebug = getParams.enableDebug()
if (enableDebug) {
    mode.awaitIncomingSceneFile(openScene)
} else {
    mode.awaitDefaultSceneFile(openScene)
}