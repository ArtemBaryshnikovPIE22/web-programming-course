import Task4 from './tasks/Task4';

import { Auth } from '@course/auth-component';

function App() {
  return (
    <Auth>
      {<Task4 />}
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-center">QUIZ GAME<br />from<br />lr4/src/Task4.tsx</h1> {/* <Task4 /> */}
      </div>
    </Auth>
  )
}

export default App;


// import Task4 from './tasks/Task4';

// import { Auth } from '@course/auth-component';

// function App() {
//   return (
//     <Auth>
      
//     </Auth>
//   )
// }

// export default App;
