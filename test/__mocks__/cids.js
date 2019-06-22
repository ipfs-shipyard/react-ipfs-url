class CID {
    constructor(hash) {
        this.hash = hash;
    }

    toString() {
        return this.hash;
    }
}

export default CID;
