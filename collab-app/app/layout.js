import "./css/globals.css";
import { StateProvider } from './contexts/userState.jsx'
import { RoomStateProvider } from './contexts/stateContext.jsx'
import { StateRefProvider } from './contexts/stateRefContext.jsx'
import { SocketProvider } from './contexts/socketContext.jsx'
import { DrawingProvider } from './contexts/drawingContext.jsx' 
import { CanvasRefProvider } from './contexts/canvasRefContext.jsx'
import { CanvasProvider } from './contexts/canvasContext.jsx'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RoomStateProvider>
          <StateRefProvider>
            <SocketProvider>
              <DrawingProvider>
                <CanvasRefProvider>
                  <CanvasProvider>
                    {children}
                  </CanvasProvider>
                </CanvasRefProvider>
              </DrawingProvider>
            </SocketProvider>
          </StateRefProvider>
        </RoomStateProvider>
      </body>
    </html>
  );
}

/*Original
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StateProvider>
          {children} 
        </StateProvider>
      </body>
    </html>
  );
}
*/