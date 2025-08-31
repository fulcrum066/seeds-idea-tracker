import seedFactory from "./seedFactory"

class observer{
    notify(seedData){
        
    }
}

class subject {
    constructor(){
        this.observers = []

    }

    registerObserver(newObserver){
        this.observers.push(newObserver)
    }

    removeObserver(observer){
        index = this.observers.indexOf(observer)
        this.observers.splice(index, 1)
    }

    notifyObservers(message){
        for (i = 0; i <= this.observers; i++){
            this.observers[i].update(message)
        }
    }

}
