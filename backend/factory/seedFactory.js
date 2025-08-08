const Seed = require("../models/seedModel");

class SeedFactory {
    /**
     * create an idea with optional defaults
     * @param {Object} data - Seed properties
     * @param {string} [type] - optional type to apply different defaults
     */
    createSeed(data = {}, type = "default") {
        let defaultData = {};

        if (type === "default") {
            defaultData = {
                title: "Untitled Idea",
                description: "",
                status: "draft"
            };
        } else if (type === "templateA") {
            defaultData = {
                title: "Template A",
                description: "Predefined structure for Template A",
                status: "in-progress"
            };
        }

        return new Seed({
            ...defaultData,
            ...data // Override defaults with provided data
        });
    }
}

module.exports = new SeedFactory();
