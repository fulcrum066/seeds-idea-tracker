// /*
// heapsort = 𝑛 + (𝑛-1) * log𝑛

// procedure makeheap(T[1..n])
//     for i = n ÷ 2 downto 1 do
//         siftdown(T, i)
//     end for
// end

// *NOTE* This file is used for sorting an idea by its metric score using the heapsort method.
// */

// class heapify extends calculate {

//     makeHeap(array, n, i) {
//         let max = i;
//         let left = 2 * i + 1;
//         let right = 2 * i + 2;

//         //if left child is larger than root 
//         if (left < n && array[left] > array[max]) {
//             max = left;
//         }

//         //if right child is larger than max var
//         if (right < n && array[right] > array[max]) {
//             max = right;
//         }

//         //if max is not root
//         if (max !== i) {
//             let temp = array[i]; //swap
//             array[i] = array[max];
//             array[max] = temp;

//             //recursively
//             this.makeHeap(array, n, i);
//         }
//     }

//     calculate(array){
//         let n = array.length;

//         //build heap
//         for (let i = Math.floor(n/2) -1; i >= 0; i--){
//             this.makeHeap(array, n, i)
//         }

//         for (let i = n - 1; i > 0; i--){
//             let temp = array[0];
//             array[0] = array[i];
//             array[i] = temp;
//             this.makeHeap(array, n, i);
//         }
//     }

// }
