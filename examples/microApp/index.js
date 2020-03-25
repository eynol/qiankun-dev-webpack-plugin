
document.body.insertAdjacentHTML('afterBegin', `
<h2>MicroApp 2</h2>
<div id="root"></div>
`)

console.log('haxx   xha')

export const bootstrap = async (props) => {
    console.log(props);
    console.log('bootstraped')
}
export const mount = async (props) => {
    console.log(props);
    console.log('mount')
}

export const unmount = async (props) => {
    console.log(props);
    console.log('unmoun    t  ddd')
}
if(module.hot){
    module.hot.accept()
}
export default { mount, unmount, bootstrap }