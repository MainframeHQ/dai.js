export default class Erc20Token {

  constructor(contract) {
    this._contract = contract;
  }

  allowance(tokenOwner, spender){
    return this._contract.allowance(tokenOwner, spender);
  }

  balanceOf(owner){
    return this._contract.balanceOf(owner);
  }

  approve(spender, value){
    return this._contract.approve(spender, value);
  }

  approveUnlimited(spender){
    return this._contract.approve(spender, -1);
  }

  transfer(from, to, value){
    return this._contract.transfer(from, to, value);
  }

  transferWithEthersJS(to, value){
  	return this._contract.transfer(to, value);
  }

  totalSupply(){
    return this._contract.totalSupply();
  }
}