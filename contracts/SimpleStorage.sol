// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract SimpleStorage {
    string private data;

    // Lưu trữ một chuỗi
    function set(string memory _data) public {
        data = _data;
    }

    // Truy xuất chuỗi đã lưu trữ
    function get() public view returns (string memory) {
        return data;
    }
}
