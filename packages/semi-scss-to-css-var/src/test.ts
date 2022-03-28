(() => {
    const str = `xxxxx rgba(1,1,1,1) xxx cubic-bezier(calc($a - ( $b + ( $c + $d ) + ( $e + $f) - $g)) $h,1, 1 + $i ,1)`;
    const func = (str: string) => {
        const injectCalcIndex: { start: number, end: number }[] = [];
        let left = 0;
        let right = 0;

        const detectSpace = (autoJump: boolean = false):[boolean, number] => {
            if (!str[right]){
                return [false,0];
            }
            let flag = false;
            let jumpCount = 0;
            while (true) {
                const char = str[right + jumpCount];
                if (/\s/.test(char)) {
                    jumpCount++;
                    flag = true;
                } else {
                    break;
                }
            }
            if (autoJump) {
                right += jumpCount;
            }
            return [flag, jumpCount];
        };

        const detectScssVar = (autoJump: boolean = false, variables: 'left' | 'right' = 'right'):[boolean, number]  => {
            let jumpCount = 0;
            const startIndex = variables === 'left' ? left : right;
            if (!str[startIndex]){
                return [false,0];
            }
            if (str[startIndex] !== '$') {
                return [false, jumpCount];
            } else {
                jumpCount++;
            }
            while (true) {
                const char = str[startIndex + jumpCount];
                if (/[a-zA-Z_\-0-9]/.test(char)) {
                    jumpCount++;
                } else {
                    break;
                }
            }
            if (autoJump) {
                if (variables === 'left') {
                    left += jumpCount;
                } else {
                    right += jumpCount;
                }
            }
            return [true, jumpCount];
        };

        const detectConst = (autoJump: boolean = false):[boolean, number]  => {
            if (!str[right]){
                return [false,0];
            }
            let jumpCount = 0;
            if (!/\w|\d/.test(str[right])) {
                return [false, 0];
            } else {
                jumpCount++;
            }
            while (true) {
                const char = str[right + jumpCount];
                if (/\w|\d/.test(char)) {
                    jumpCount++;
                } else {
                    break;
                }
            }
            if (autoJump) {
                right += jumpCount;
            }
            return [true, jumpCount];
        };

        const detectOperator = (autoJump: boolean = false):[boolean, number]  => {
            if (!str[right]){
                return [false,0];
            }
            const char = str[right];
            if (/\+|\-|\*|\//.test(char)) {
                if (autoJump) {
                    right += 1;
                }
                return [true, 1];
            } else {
                return [false, 0];
            }
        };

        const detectBucket = (autoJump: boolean = false):[boolean, number]  => {
            if (!str[right]){
                return [false,0];
            }
            if (str[right] !== '(') {
                return [false, 0];
            } else {
                const stack = [];
                while (true) {
                    let i = right;
                    stack.push(str[i]);
                    while (stack.length > 0) {
                        i++;
                        if (str[i] === ')') {
                            stack.pop();
                        } else if (str[i] === '(') {
                            stack.push('(');
                        }
                    }
                    // The i is the end of bucket;
                    if (autoJump) {
                        right = i + 1;
                    }
                    return [true, i + 1];
                }
            }
        };

        let isInCalc = false;
        while (left < str.length) {

            if (!isInCalc) {
                //is scss variable start
                const [scssVarFlag, scssVarCount] = detectScssVar(false, 'left');
                if (!scssVarFlag) {
                    left++;
                    continue;
                }
                right = left + scssVarCount;
                detectSpace(true);
                const [operatorFlag,] = detectOperator(true);
                if (!operatorFlag) {
                    //there is no calc logic
                    left = right + 1;
                    continue;
                }
            }
            // str[right] is an operator
            detectSpace(true);
            const [bucketFlag,] = detectBucket(true);
            const [constFlag,] = detectConst(true);
            const [scssVarFlag,] = detectScssVar(true);
            if (bucketFlag || constFlag || scssVarFlag) {
                const [operatorFlag,] = detectOperator(true);
                if (operatorFlag) {
                    isInCalc = true;
                } else {
                    injectCalcIndex.push({ start: left, end: right - 1 });
                    isInCalc = false;
                    left = right;
                }
            } else {
                throw new Error(`Error: while replace scss calc to css calc, target value:  "${str}" , left:${left}, right:${right}, target value near error is "${str.slice(left,right+1)}"`,);
            }

        }

        return injectCalcIndex;

    };
    console.log(func(str));
})();
