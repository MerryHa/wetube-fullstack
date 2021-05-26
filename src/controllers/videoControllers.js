export const trending = (req, res) => res.render("home"); //렌더할 뷰 이름을 넣어준다.
export const see = (req, res) => {
    return res.send(`Watch Video #${req.params.id}`);
}
export const edit = (req, res) => res.send("Edit");
export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => res.send("Delete Video");


