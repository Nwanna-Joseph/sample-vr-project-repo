import * as scene from '../scenes/scenes_32.json'

export default {
    awaitIncomingSceneFile: (callback) => {
        window.addEventListener("message", (event) => callback(event.data))
    },
    awaitDefaultSceneFile: (callback) => {
        callback(scene)
    }
}