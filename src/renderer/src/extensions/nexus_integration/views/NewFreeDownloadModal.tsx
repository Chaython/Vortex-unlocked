import type { TFunction } from "i18next";
import * as React from "react";
import { Button } from "react-bootstrap";

import FlexLayout from "../../../controls/FlexLayout";
import Image from "../../../controls/Image";
import { Pictogram } from "../../../ui/components/pictogram/Pictogram";

export interface INewFreeDownloadModal {
  t: TFunction;
  fileInfo: any;
  openModPage: () => void;
  onDownload: () => void;
  positionText: string;
}

function NewFreeDownloadModal(props: INewFreeDownloadModal) {
  const { t, fileInfo, openModPage, onDownload, positionText } = props;

  return (
    <div>
      <FlexLayout type="column" id="content-container">
        {/* First row - spans full width */}
        <FlexLayout.Fixed>
          {fileInfo !== null ? (
            <FlexLayout type="row" id="top-row">
              <FlexLayout.Fixed>
                <Image id="mod-thumbnail" srcs={[fileInfo.mod.pictureUrl]} />
              </FlexLayout.Fixed>

              <FlexLayout.Flex>
                <FlexLayout type="column">
                  <div id="mod-name">{fileInfo.mod.name}</div>
                  <div id="mod-author">by {fileInfo.mod.uploader.name}</div>
                </FlexLayout>
              </FlexLayout.Flex>

              <FlexLayout.Fixed>
                <div id="mod-count">{positionText}</div>
              </FlexLayout.Fixed>
            </FlexLayout>
          ) : (
            <FlexLayout type="row" id="top-row">
              <FlexLayout.Fixed>
                <div>Loading...</div>
              </FlexLayout.Fixed>
            </FlexLayout>
          )}
        </FlexLayout.Fixed>

        {/* Vortex Unlocked: the free/premium membership comparison was removed;
            only the functional "fetch an authorised link" flow remains. */}
        <FlexLayout.Fixed>
          <FlexLayout type="row" id="bottom-row">
            <FlexLayout.Flex>
              <FlexLayout type="column" id="free-container">
                <Pictogram brand="none" className="mb-3" name="no-mod" size="xs" />
                <div className="title">{t("Fetch the download link from the website")}</div>
                <hr />
                <ul>
                  <li>{t("The download will continue automatically once the link arrives")}</li>
                  <li>
                    {t(
                      "You can also open the file page and start the download from there directly",
                    )}
                  </li>
                </ul>
                <Button id="download-mod-button" onClick={onDownload}>
                  {t("Open file page")}
                </Button>
                <Button id="mod-page-button" bsStyle="link" onClick={openModPage}>
                  {t("Open mod page")}
                </Button>
              </FlexLayout>
            </FlexLayout.Flex>
          </FlexLayout>
        </FlexLayout.Fixed>
      </FlexLayout>
    </div>
  );
}

export default NewFreeDownloadModal;
