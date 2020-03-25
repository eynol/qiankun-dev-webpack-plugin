

import { registerMicroApps, start } from 'qiankun'

registerMicroApps([{
    name: 'app1',
    entry: 'http://localhost:8080/',
    render: (...conf) => { console.log(...conf) },
    activeRule: (location) => {
        console.log(location)
        return true
    }
}])

start()