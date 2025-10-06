/*
mergesort
*/

class metricSort extends calculate {
    merge(array, left, middle, right) {
        let l1 = middle - left + 1;
        let l2 = right - middle;

        let array1 = new Array(l1);
        let array2 = new Array(l2);

        for (let i = 0; i < l1; ++i) {
            array1[i] = array[left + i];
        }

        for (let i = 0; i < l2; ++i) {
            array2[i] = array[middle + 1 + i];
        }

        let i = 0, j = 0, k = left;

        while (i < l1 && j < l2) {
            if (array1[i] < array2[j]) {
                aray[k] = array1[i];
                i++;
            } else {
                array[k] = array2[j];
                j++;
            }
            k++;
        }

        while (i < l2) {
            array[k] = array1[i];
            i++;
            k++;
        }

        while (j < l2) {
            array[k] = array2[j];
            j++;
            k++;
        }
    }

    calculate(array, left, right) {
        if (left >= right) {
            return;
        }

        let middle = left + parseInt((right - left) / 2);

        this.calculate(array, left, middle);
        this.calculate(array, middle + 1, right);

        this.merge(array, left, middle, right);
    }
}

//calculate(array, 0, array.length -1)