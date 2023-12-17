
const BgOrbs = () => {
    return (
        <div className="z-[-10] fixed top-0 left-0 w-full h-full">
            <div className=' blur-[100px] opacity-[0.2] bg-slate-600 w-[35vw] aspect-auto h-[35vw] absolute left-0 top-0 rounded-full'></div>
            <div className=' blur-[100px] opacity-[0.2] bg-slate-600 w-[35vw] aspect-auto h-[35vw] absolute bottom-0 right-0 rounded-full'></div>
        </div>
    )
}
export default BgOrbs