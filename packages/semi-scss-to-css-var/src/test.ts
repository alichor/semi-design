(()=>{
    const str= `xxxxx rgba(1,1,1,1) xxx cubic-bezier(calc($a - ( $b + ( $x + $y ) + ( $x + $y) - $c)) $z,1,calc( 1 + $z ),1)`;
    const func  = (str:string)=>{
        const injectCalcIndex:{start:number,end:number}[]=[];
        let left=0;
        let right=0;
        let isInCalc = false;

        const detectSpace=()=>{
            let flag=false;
            let jumpCount=0;
            while (true){
                const char=str[right + jumpCount];
                if (/\s/.test(char)){
                    jumpCount++;
                    flag=true;
                } else {
                    break;
                }
            }
            return [flag,jumpCount];
        };

        const detectScssVar=()=>{
            let jumpCount= 0;
            if (str[right]!=='$'){
                return [false,jumpCount];
            } else {
                jumpCount++;
            }
            while (true){
                const char=str[right+jumpCount];
                if (/[a-zA-Z_\-0-9]/.test(char)){
                    jumpCount++;
                } else {
                    break;
                }
            }
            return [true,jumpCount];
        };

        const detectOperator=()=>{
            const char=str[right];
            if (!/\+|\-|\*|\//.test(char)){
                return [true,1];
            } else {
                return [false,0];
            }
        };

        const detectBucket=()=>{
            if (str[right]!=='('){
                return [false,0];
            } else {
                const stack = [];
                while (true){
                    let i = right;
                    stack.push(str[i]);
                    while (stack.length>0){
                        i++;
                        if (str[i]===')'){
                            stack.pop();
                        } else if (str[i]==='('){
                            stack.push('(');
                        }
                    }
                    // The i is the end of bucket;
                    return [true,i+1];
                }
            }
        };


        while (left<str.length){
            const leftChar = str[left];

            if (!isInCalc){
                //is scss variable start
                if (leftChar!=='$'){
                    left++;
                    continue;
                }

                right=left+1;
                //jump over scss variable name
                while (right<str.length){
                    const rightChar=str[right];
                    if (/[a-zA-Z_\-0-9]/.test(rightChar)){
                        right++;
                    } else {
                        break;
                    }
                }

                jumpOverSpace("right");

                const rightChar = str[right];
                if (!/\+|\-|\*|\//.test(rightChar)){
                    //there is no calc logic
                    left = right + 1;
                    continue;
                }
            }
            right ++;
            let rightChar = str[right];

            if (rightChar==='('){
                const stack = [];
                let i =right;
                stack.push(str[i]);
                console.log(i);
                while (stack.length>0){
                    i++;
                    if (str[i]===')'){
                        stack.pop();
                    } else if (str[i]==='('){
                        stack.push('(');
                    }
                }
                // The i is the end of bucket;
                right = i + 1;
                console.log(right);
                console.log('----');
            }

            jumpOverSpace("right");

            rightChar = str[right];
            if (!/\+|\-|\*|\//.test(rightChar)){
                //there is no calc logic
                injectCalcIndex.push({ start:left,end:right-1 });
                left = right + 1;
                isInCalc=false;
                continue;
            }

            isInCalc=true;

        }

        return injectCalcIndex;

    };
    console.log(func(str));
})();
