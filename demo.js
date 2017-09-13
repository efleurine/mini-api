const f = (x) => {
  console.log(x)
}


const chain = [f, f, f, f]


const chain2 = []

const lambda = ({ next, msg }) => {
  console.log(number)
  next()
}

const routes = [lambda, lambda, lambda]

// lambda({ msg: 'hello', next: () => '' })

// const pre = (next) => {
//   return (x) => {
//     console.log('pre - will call next')
//     next()
//   }
// }

// const v = pre(() => console.log('I am next'))

// v()

// for (let i = 0; i < chain.length; i += 1) {
//   chain2.push(chain[i])
// }

// const nextFactory = (next)

const init = (next) => {
  return () => {
    console.log('number = 0')
    next({ number: 0 })
  }
}


chain2.push(init(chain[0]))

const final = ({ number }) => {
  console.log('number = ', number + 1)
}

// for (let i = 0; i < chain.length - 1 ; i += 1) { // we need to stop so we can add final
//   let fn = chain[i]
//   chain2.push()
// }

for (let i = 0; i < chain2.length; i += 1) {
  chain2[i]()
}

// [1, 2, 3] init => 1 => 2 => 2 => 3 => final
