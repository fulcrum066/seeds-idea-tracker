class observer{
    constructor(){
        this.status = false
        this.seedTitle = ''
        this.creatorName = ''
        this.description = ''
        this.boardName = ''
        this.metricScore = ''
        this.seedID = null

    }
    update(status, seedTitle, creatorName, description, boardName, metricScore, seedID){
        this.status = status
        this.seedTitle = seedTitle
        this.creatorName = creatorName
        this.description = description
        this.boardName = boardName
        this.metricScore = metricScore
        this.seedID = seedID
    }

    getStatus(){
        return this.status
    }

    getInfo(){
        return [this.status, this.seedTitle, this.creatorName, this.description, this.boardName, this.metricScore, this.seedID]
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

    notifyObservers(new_status, seedTitle, creatorName, description, boardName, metricScore, seedID){
        for (let i = 0; i < this.observers.length; i++){
            this.observers[i].update(new_status, seedTitle, creatorName, description, boardName, metricScore, seedID)
        }
        
    }

    checkStatusObservers() {
        const statuses = [];
        for (let i = 0; i < this.observers.length; i++) {
            statuses.push(this.observers[i].getStatus());
        }
        return statuses;
    }

    getObserverInfo(index){
        return this.observers[index].getInfo()
    }


}

// Creating subjects and observers
const createSubject = new subject();
const ideaObserver = new observer();

createSubject.registerObserver(ideaObserver)

module.exports = { createSubject };