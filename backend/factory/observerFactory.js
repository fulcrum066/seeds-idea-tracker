class observer{
    constructor(){
        this.status = false

    }
    update(new_status){
        this.status = new_status
    }

    getStatus(){
        return this.status
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

    notifyObservers(new_status){
        for (let i = 0; i < this.observers.length; i++){
            this.observers[i].update(new_status)
        }
        
    }

    checkStatusObservers() {
        const statuses = [];
        for (let i = 0; i < this.observers.length; i++) {
            statuses.push(this.observers[i].getStatus());
        }
        return statuses;
    }


}

// Creating subjects and observers
const createSubject = new subject();
const ideaObserver = new observer();

createSubject.registerObserver(ideaObserver)

module.exports = { createSubject };