// src/features/board/boardService.js
import axios from "axios";

const API_URL = import.meta.env?.VITE_API_URL || ""; // keep empty if you proxy

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export async function getBoards(token) {
  const res = await axios.get(`${API_URL}/api/board/board`, authHeader(token));
  return res.data;
}

export async function createBoard(token, payload) {
  const res = await axios.post(`${API_URL}/api/board/board`, payload, authHeader(token));
  return res.data;
}

export async function updateBoard(token, boardId, payload) {
  const res = await axios.put(`${API_URL}/api/board/board/${boardId}`, payload, authHeader(token));
  return res.data;
}

export async function modifyBoard(token, boardId, payload) {
  const res = await axios.patch(`${API_URL}/api/board/board/${boardId}`, payload, authHeader(token));
  return res.data;
}

export async function deleteBoard(token, boardId) {
  const res = await axios.delete(`${API_URL}/api/board/board/${boardId}`, authHeader(token));
  return res.data;
}
