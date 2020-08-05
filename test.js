function tester(tes) {
  tes[0] = 2
}
function tester2(num) {
  num = 4
}
const num = 2
tester2(num)
console.log(num)
const a = [1, 1, 1]
tester(a)
console.log(a)
