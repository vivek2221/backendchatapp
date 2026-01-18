

function CustomInput({inputHint,inputValue,setValues,error,classForDivs,classN}){
    return(
        <div className={classForDivs}>
            <input className={classN}  placeholder={inputHint} value={inputValue} onChange={(e)=>{
                setValues((prev)=>({...prev,[inputHint]:`${(e.target.value).trim()}`}))
            }}></input>
            <p className="errors">{error}</p>
        </div>
    )


}
export default CustomInput