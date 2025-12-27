import '@/css/globals.css'
import '@/css/switch.css'


const Switch = ({state, target, func, action}) => {

    const handleClick = () => {
        func(target, !state);
        action();
    };

    return (
        <div className='switch-container' onClick={handleClick}>
            <div className='switch-toggle'
                style={{
                    left: `${!state ? '1%' : '55%'}`,
                    backgroundColor: `${!state ? 'var(--raspberry)' : 'var(--lime-green)'}`,
                }}
            ></div>
        </div>
    )
}

export default Switch