class Metric {
    //weights are chosen by an admin when creating a project board. Can also update weights later, but when updating, the weights should be updated for all ideas in the board.
    static METRIC_KEYS = [
        'roi',
        'maintainCompliance',
        'reduceCost',
        'reduceRisk',
        'impProductivity',
        'impProcesses',
        'newRevStream'
    ];

    static calculateMetric(factors, weights) {
        let metricValue = 0;

        for (const key of Metric.METRIC_KEYS) {
            metricValue += (factors[key] ?? 0) * (weights[key] ?? 0);
        }

        return metricValue;
    }
}