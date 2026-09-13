### 出处

Gary Bernhardt 的「Functional Core, Imperative Shell」。

### 为什么

纯函数不需要 mock 任何东西就能测——给输入、断言输出。可测性不是测出来的,是拆出来的。

### 怎么分

业务规则往核心推;数据库、网络、时钟、随机数挤到壳里;核心不 import 任何 IO 库。

### 判断法

核心里出现一个 new Date() 或 fetch(),就是边界漏了。
