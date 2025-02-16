
let searchParams = undefined

function getParams(param){
    if(!searchParams){
        searchParams = new URL(window.location.href).searchParams
    }
    return searchParams.get(param);
}

export default {
    enableDebug : () => getParams('enableDebug')
}