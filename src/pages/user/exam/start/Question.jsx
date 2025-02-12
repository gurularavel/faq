export default function Question({ data, selectedAnswer, setSelectedAnswer }) {
  const handleChoose = (id) => {
    if (id !== selectedAnswer) {
      setSelectedAnswer(id);
    } else {
      setSelectedAnswer(null);
    }
  };
  return (
    <>
      <div
        className="title"
        dangerouslySetInnerHTML={{ __html: data?.title }}
      />
      <div className="answers">
        {data?.answers?.map((a, i) => (
          <div
            key={i}
            className={`answer-item ${
              a.uuid === selectedAnswer ? "selected" : ""
            }`}
            onClick={() => handleChoose(a.uuid)}
          >
            <span className="letter">{String.fromCharCode(i + 65)}</span>
            <div
              className="answer-item-inner"
              dangerouslySetInnerHTML={{ __html: a.title }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
