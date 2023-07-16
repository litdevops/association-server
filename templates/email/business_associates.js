const Confirmation = ({
  help_text,
  link,
  phone,
  email,
  title,
  message,
  action_title,
  follow,
  copyright,
  unsubscribe,
}) => {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html>
  <head>
  <meta content="width=device-width,initial-scale=1" name="viewport">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Mallsec</title>
  <link href='http://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700' rel='stylesheet' type='text/css'>
  <style type="text/css">
  html {
      width: 100% !important;
  }
  body {
      width: 100% !important;
      margin: 0;
      padding: 0;
  }
  .ReadMsgBody {
      width: 100%;
      background-color: #d3dbe3;
  }
  .ExternalClass {
      width: 100%;
      background-color: #d3dbe3;
  }
  a img, img {
      line-height: 100%;
      outline: 0;
      text-decoration: none;
      margin: 0;
      border: 0;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
  }
  @media only screen and (max-width: 739px) {
  body table table {
      width: 100% !important;
  }
  body table [class="wd-auto"] {
      width: auto !important;
  }
  body td[class="header-center-pad5"] {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 5px 0px !important;
  }
  body td[class="top-link"], body td[class="in-block"] {
      display: block !important;
      width: 100% !important;
      padding: 0px !important;
  }
  body td[class="box"] {
      display: block !important;
  }
  body td a[class=menu] {
      padding: 0px 1.5% !important;
      font-size: 12px !important;
  }
  body td [class="td-pad-20"] {
      padding: 20px !important;
  }
  body td [class="pad-T20"] {
      padding-top: 20px !important;
  }
  body td [class="pad-B20"] {
      padding-bottom: 20px !important;
  }
  body td [class="pad-B0"] {
      padding-bottom: 0px !important;
  }
  body td [class="pad-LR"] {
      padding-left: 20px !important;
      padding-right: 20px !important;
  }
  body td [class="pad-TB"] {
      padding-top: 20px !important;
      padding-bottom: 20px !important;
  }
  body td [class="pad-LRB"] {
      padding-left: 20px !important;
      padding-right: 20px !important;
      padding-bottom: 20px !important;
  }
  body td [class="pad-TB-only"] {
      padding-top: 20px !important;
      padding-left: 0px !important;
      padding-right: 0px !important;
      padding-bottom: 20px !important;
  }
  body table [class="mob-hidden"] {
      display: none !important;
  }
  body table [class="center"] {
      text-align: center !important;
  }
  body td [class="size-18"] {
      font-size: 18px !important;
      padding-top: 20px !important
  }
  body td [class="size-20"] {
      font-size: 20px !important;
      line-height: 25px !important;
  }
  body td[class="key-list"] {
      display: block !important;
      width: 100% !important;
  }
  body td[class="pricingbox"] {
      display: block !important;
      width: auto !important;
  }
  }
  </style>
  </head>
  
  <body style="padding:0px; margin:0; background:#e6e9ec;">
  <!-- Start Template -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e6e9ec">
    <tr>
      <td align="center" valign="top"><table cellpadding="0" cellspacing="0" border="0" width="900" align="center">
          <tr>
            <td class="pad-LRB" align="center" valign="top" bgcolor="#1890ff" style=" padding:0px;"><!--[if gte mso 9]>
                                  <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="mso-width-percent:1000;min-height:1400px;mso-position-horizontal:center;">
                                      <v:fill type="tile" src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/wc-bg.jpg" color="#eaeaea"  />
                                  </v:background>
                              <![endif]--> 
              
              <!-- Start Logo -->
              
              <table cellpadding="0" cellspacing="0" border="0" width="680" align="center" >
                <tr>
                  <td align="center" style="padding:45px 0px ;" class="td-pad-20"><a style="text-decoration:none; outline:none;" href="#" title="Mallsec"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/mallsett-logo-white.png" width="278" style="display:block;" /></a></td>
                </tr>
              </table>
              
              <!-- End Logo --> 
              <!-- Start Header -->
              
              <table width="680" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" style="background:#ffffff; border-radius:4px 4px 0px 0px; padding:10px 25px 40px;" bgcolor="#ffffff" class="td-pad-20"><table align="center" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td class="header-center-pad5" align="left" style="font-weight:400; font-size:13px; color:#5c6f7c; font-family:Poppins; mso-line-height-rule: exactly; text-decoration:underline; padding-top:10px; padding-bottom:10px;"><a href="https://www.mallsec.com/mall?contact" title="Need Help or Questions?" style="color:#5c6f7c;">
                          ${help_text || "Need Help or Questions?"}
                          </a></td>
                        <td class="header-center-pad5" align="right"><table cellpadding="0" cellspacing="0" border="0" >
                            <tr>
                              <td align="center" style="text-align:center; padding-right:20px;padding-top:10px; padding-bottom:10px;"><table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td class="top-link" valign="top"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/phone-icon.png" width="40" height="25"></td>
                                    <td class="top-link" style="font-size:12px; color:#5c6f7c; font-family:Poppins; mso-line-height-rule: exactly;">${
                                      phone || "1-305-526-4236"
                                    }</td>
                                  </tr>
                                </table></td>
                              <td align="center" style="text-align:center; padding-top:10px; padding-bottom:10px;"><table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td class="top-link" valign="top"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/mail-icon.png" width="40" height="18"></td>
                                    <td class="top-link" style="font-size:12px; color:#5c6f7c; font-family:Poppins; mso-line-height-rule: exactly;"><a style="color:#5c6f7c; text-decoration:none;" href="info@mallsec.com" title="info@mallsec.com">
                                      ${email || "info@mallsec.com"}
                                      </a></td>
                                  </tr>
                                </table></td>
                            </tr>
                          </table></td>
                      </tr>
                    </table></td>
                </tr>
              </table>
              
              <!-- End Header --> 
              <!-- Start Activate  -->
              
              <table width="680" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" style="background:#ffffff; padding:0px 40px;" bgcolor="#ffffff" class="pad-LR"><table align="center" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding:0px 0px 40px;" class="pad-B20"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/mall.png" width="358" style="display:block;" /></td>
                      </tr>
                      <tr>
                        <td><table align="center" cellpadding="0" cellspacing="0" border="0" width="515">
                            <tr>
                              <td class="size-20" align="center" style="font-weight:600; font-size:34px; color:#203442; font-family:poppins; mso-line-height-rule: exactly; text-align:center; line-height:34px;">
                                ${title || "Activate Mallsett account"}
                              </td>
                            </tr>
                            <tr>
                              <td class="pad-TB-only" align="center" style="font-weight:400; font-size:14px; color:#51636f; font-family:poppins; mso-line-height-rule: exactly; line-height:26px; padding:10px 30px 20px;">
                                ${
                                  message ||
                                  "Use the link below activate your account with <a href=" +
                                    link +
                                    "> Ganani .com </a>"
                                }
                                </td>
                            </tr>
                           
                            <tr>
                              <td align="center" valign="top" style="padding:20px 0px 40px;" class="pad-B20"><!--[if mso]>
                                                                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:56px;v-text-anchor:middle;width:190px;" arcsize="1%" strokecolor="#675eee" fillcolor="#675eee">
                                                                  <w:anchorlock/>
                                                                  <center style="color:#ffffff;font-family:Poppins;font-size:16px; font-weight:400;">Activate Now!</center>
                                                                  </v:roundrect>
                                                                  <![endif]--> 
                                <a title="Activate Now!" href="${link}" style="background-color:#1890ff; border:solid 1px #0b6fcd; border-radius:2px;color:#ffffff;display:inline-block;font-family:Poppins; font-weight:400; font-size:16px; line-height:56px;text-align:center;text-decoration:none;width:190px;-webkit-text-size-adjust:none;mso-hide:all;outline:none;">${
    action_title || "Activate Now!"
  }</a></td>
                            </tr>
                            <tr>
                              <td align="center" style="font-weight:400; font-size:15px; color:#203442; font-family:poppins; mso-line-height-rule: exactly; line-height:26px; padding:0px;">${
                                follow || "Follow us on social media"
                              }</td>
                            </tr>
                            
                          </table></td>
                      </tr>
                    </table></td>
                </tr>
              </table>
              
              <!-- End Activate --> 
              
              <!-- Start Footer-->
              
              <table align="center" cellpadding="0" cellspacing="0" border="0" width="680">
                <tr>
                  <td align="center" valign="top" class="td-pad-20" style="padding:40px 0px; background:#ffffff; border-radius:0px 0px 4px 4px;" bgcolor="#ffffff"><table cellpadding="0" cellspacing="0" border="0" >
                      <tr>
                        <td align="center" valign="top" style="padding:15px 0px;"><table cellpadding="0" cellspacing="0" border="0" align="center" class="wd-auto">
                            <tr>
                              <td align="center" valign="top" style="width:40px; height:33px;"><a style="text-decoration:none; outline:none;" href="#" title="Facebook"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/facebook.png" width="33" style="display:block;" /></a></td>
                              <td align="center" valign="top" style="width:40px; height:33px;"><a style="text-decoration:none; outline:none;" href="#" title="Twitter"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/twitter.png" width="33" style="display:block;" /></a></td>
                              <td align="center" valign="top" style="width:40px; height:33px;"><a style="text-decoration:none; outline:none;" href="#" title="You Tube"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/youtube.png" width="33" style="display:block;" /></a></td>
                              <td align="center" valign="top" style="width:40px; height:33px;"><a style="text-decoration:none; outline:none;" href="#" title="Instagram"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/instagram.png" width="33" style="display:block;" /></a></td>
                              <td align="center" valign="top" style="width:40px; height:33px;"><a style="text-decoration:none; outline:none;" href="#" title="Start Engine"><img src="https://mallsett-files-public.s3.us-east-2.amazonaws.com/mallsett-start-engine.png" width="33" style="display:block;" /></a></td>
                            </tr>
                          </table></td>
                      </tr>
                      <tr>
                        <td align="center" style="font-weight:400; font-size:12px; color:#959595; font-family:poppins; mso-line-height-rule: exactly; line-height:14px; padding-bottom:10px;">© ${
                          copyright || "2020 Mallsett, Inc. All Rights Reserved"
                        }</td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:0px;"><table cellpadding="0" cellspacing="0" border="0" align="center" class="wd-auto">
                            <tr>
                              <td align="center" valign="top" style="font-weight:400; font-size:12px; color:#5c6f7c; font-family:poppins; mso-line-height-rule: exactly; line-height:18px;"><a href="#" style="color:#5c6f7c;" title="Products">
                                Invest
                                </a></td>
                              <td align="center" valign="top" width="30" style="font-weight:400; font-size:12px; color:#5c6f7c; font-family:poppins; mso-line-height-rule: exactly; line-height:18px;">•</td>
                              <td align="center" valign="top" style="font-weight:400; font-size:12px; color:#5c6f7c; font-family:poppins; mso-line-height-rule: exactly; line-height:18px;"><a href="#" style="color:#5c6f7c;" title="Blog">
                                Documentation
                                </a></td>
                              <td align="center" valign="top" width="30" style="font-weight:400; font-size:12px; color:#5c6f7c; font-family:poppins; mso-line-height-rule: exactly; line-height:18px;">•</td>
                              <td align="center" valign="top" style="font-weight:400; font-size:12px; color:#5c6f7c; font-family:poppins; mso-line-height-rule: exactly; line-height:18px;"><a href="#" style="color:#5c6f7c;" title="Unsubscribe">
                                ${unsubscribe || "Unsubscribe"}
                                </a></td>
                            </tr>
                          </table></td>
                      </tr>
                    </table></td>
                </tr>
              </table>
              
              <!-- End Footer--> 
              <!-- Start Footer Space-->
              
              <table width="680" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="height:100px;" height="100" class="mob-hidden" valign="top" align="center">&nbsp;</td>
                </tr>
              </table>
              
              <!-- End Footer Space--></td>
          </tr>
        </table></td>
    </tr>
  </table>
  <!-- End Template -->
  </body>
  </html>
  `;
};

module.exports = Confirmation;
