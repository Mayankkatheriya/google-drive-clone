import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import FilesList from "../common/FilesList";
import { useParams } from "react-router-dom";

const SearchItems = () => {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);

  const params = useParams();
  const query = params.query;
  console.log(query);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, (newFiles) => {
          setFiles(newFiles);
        });

        return () => {
          unsubscribeFiles();
        };
      }
    };

    fetchData();
  }, [query]);

  useEffect(() => {
    const searchArr = files.filter((file) =>
      file.data.filename.toLowerCase().includes(query.toLowerCase())
    );
    setData(searchArr);
  }, [files, query]);

  return (
    <RecentContainer>
      <PageHeader pageTitle={`Searched Files for '${query}'`} />
      <FilesList
        data={data}
        imagePath={"/search.svg"}
        text1={"No matching results"}
        text2={"Adjust your query or try searching all of Drive"}
      />
    </RecentContainer>
  );
};

const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default SearchItems;
